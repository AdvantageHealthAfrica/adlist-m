import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Pharmacy } from '../entities/pharmacy.entity';
import { User } from '../../users/user.entity';
import { UniversalListService } from '../../universal-list/universal-list.service';
import { PharmacyProduct } from '../entities/pharamcy.product.entity';
import { OverallInventoryUpdateTime } from '../entities/overall.pharmacy.product.update.time.entity';
import { PharmacyProductDosageForm } from '../../enums/pharmacy.product.dosage.form';
import { TimeLapses } from '../../enums/time.lapses';
import { QuantityTypes } from '../../enums/product.quantity.types';
import { Role } from '../../enums/role.enum';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory/casl-ability.factory';
import { Action } from 'src/enums/actions.enums';
const moment = require('moment');

@Injectable()
export class PharmaciesService {
  constructor(
    @InjectRepository(PharmacyProduct)
    private pharmProductRepo: Repository<PharmacyProduct>,
    @InjectRepository(Pharmacy) private pharmRepo: Repository<Pharmacy>,
    @InjectRepository(OverallInventoryUpdateTime) private overallUpdateTime: Repository<OverallInventoryUpdateTime>,
    private universalListService: UniversalListService,
    private caslAbilityFactory: CaslAbilityFactory, 
  ) { }

  async createPharmacy(name: string, phoneNumber: string, emailAddress: string, location: string, admin: User) {
    let existingPharmacy = await this.pharmRepo.findOneBy({ emailAddress })
    if (existingPharmacy) {
      throw new HttpException("Pharmacy must have unique email address. Already exist.", HttpStatus.BAD_REQUEST)
    }
    let pharmacy = this.pharmRepo.create({ name, phoneNumber, emailAddress, location, admin });
    pharmacy = await this.pharmRepo.save(pharmacy);
    return {
      message: 'Pharmacy created',
      data: pharmacy,
    };
  }


  async getPharmacies(user: User) {
    
    if (user.role == Role.Pharmacist) {
      throw new HttpException("Invalid request as a pharmacist", HttpStatus.BAD_REQUEST)
    }
    let pharmacies = await this.pharmRepo.find()
    if (pharmacies.length) {
      return pharmacies
    }

    return {
      message: "No pharmacy created"
    }
  }


  async getPharmacy(user: User, pharmacy_id: number) {
    const ability = this.caslAbilityFactory.createForUser(user)

    let pharmacy = await this.pharmRepo.findOneBy({ id: pharmacy_id })
    if (!pharmacy) {
      throw new HttpException("Pharmacy with id does not exist", HttpStatus.NOT_FOUND)
    }
    if (!ability.can(Action.Read, pharmacy)) {  // works on a user with Role.Pharmacist
      throw new HttpException("You do not have permissions to read pharmacy data that does not belong to you.", HttpStatus.BAD_REQUEST)
    }
    return pharmacy
  }

  // this will be used to help redirect the signed in pharmacist to their page after log in
  async getAssignedPharmacyByEmail(email: string) {
    const assignedPharmacy = await this.pharmRepo.findOneBy({ emailAddress: email })
    return assignedPharmacy
  }

  async checkForPharmacyProductInUniversalListWithNafdacNumberOrProductCode(
    pharmacy_id: number,
    nafdacNumberOrProductCode: string,
  ) {
    const pharmacy = await this.pharmRepo.findOneBy({ id: pharmacy_id });
    if (!pharmacy) {
      throw new HttpException(
        'Pharmacy with id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    const universalListProducts = await this.universalListService.getUniversalListProducts();

    for (let product of universalListProducts) {
      if (product['nafdac_number'] == nafdacNumberOrProductCode || product['product_code'] == nafdacNumberOrProductCode) {
        return {
          message: `${pharmacy.name}'s product exists in universal list`,
        };
      }
    }
    throw new HttpException(`${pharmacy.name}'s product does not exist in universal list`, HttpStatus.NOT_FOUND)
  }

  async updateOverallInventoryUpdateTimeForPharmacyInventory(pharmacy_id: number, updated_at: Date) {
    // this updates the overall update time for all changes made in a pharmacy's inventory
    const pharmacy = await this.pharmRepo.findOneBy({ id: pharmacy_id });
    
    let updateTimeRecord = await this.overallUpdateTime.findOne({
      where: { pharmacy: { id: pharmacy_id } }
    })
    if (!updateTimeRecord) {
      let updateTimeRecord = this.overallUpdateTime.create({ pharmacy, updated_at })
      updateTimeRecord = await this.overallUpdateTime.save(updateTimeRecord)
      
      return updateTimeRecord.updated_at
    }

    updateTimeRecord.updated_at = updated_at
    updateTimeRecord = await this.overallUpdateTime.save(updateTimeRecord)

    return updateTimeRecord.updated_at
  }


  async getOverallInventoryUpdateTimeForPharmacyInventory(pharmacy_id: number) {
    const updateTimeRecord = await this.overallUpdateTime.findOne({
      where: { pharmacy: { id: pharmacy_id } }
    })
    return updateTimeRecord ? updateTimeRecord.updated_at : new Date().toISOString();
  }

  // this registers new pharmacy's product to be added to the universal list
  async registerNewPharmacyProduct(
    user: User,
    product_name: string,
    manufacturer: string,
    strength: string,
    unit: string,
    dosage_form: PharmacyProductDosageForm,
    pharmacy_id: number,
    drug_name?: string,
    nafdac_number?: string,
    product_code?: string,
  ) {
    const ability = this.caslAbilityFactory.createForUser(user)

    const pharmacy = await this.pharmRepo.findOneBy({ id: pharmacy_id });
    if (!pharmacy) {
      throw new HttpException(
        'Pharmacy with id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    if (nafdac_number == null && product_code == null) {
      throw new HttpException("Please input product code or Nafdac number", HttpStatus.BAD_REQUEST)
    }

    let product = this.pharmProductRepo.create({
      nafdac_number,
      product_name,
      product_code,
      manufacturer,
      strength,
      unit,
      dosage_form,
      pharmacy,
      drug_name,
    });

    // operation permission
    if (!ability.can(Action.Create, product)) {  // works on a user with Role.Pharmacist
      throw new HttpException("You do not have permissions to create product inventory for a pharmacy that does not belong to you.", HttpStatus.BAD_REQUEST)
    }
    
    product = await this.pharmProductRepo.save(product);
    await this.updateOverallInventoryUpdateTimeForPharmacyInventory(pharmacy_id, product.last_edited_at)
    return {
      message: 'Product registered to be added to universal list',
      data: product,
    };
  }

  async takeStockOfNewPharmacyProductORtakeStockOfExistingUniversalListProduct(
    user: User,
    pharmacy_id: number,
    nafdacNumberOrBarCode: string,
    quantity: number,
    selling_price: number,
    expiry_date: Date,
    cost_price?: number,
    quantity_type?: QuantityTypes
  ) {
    const ability = this.caslAbilityFactory.createForUser(user)
    
    const pharmacy = await this.pharmRepo.findOneBy({ id: pharmacy_id });
    if (!pharmacy) {
      throw new HttpException( 'Pharmacy with id does not exist', HttpStatus.NOT_FOUND);
    }
    let nafdac_number: string;
    let product_code: string;

    if (nafdacNumberOrBarCode.includes('-')) {
      nafdac_number = nafdacNumberOrBarCode;
    }
    else {
      product_code = nafdacNumberOrBarCode;
    }

    // searching for pharmacy product with either nafdac number or bar code
    let pharmProduct =
      nafdac_number != null ? await this.pharmProductRepo.findOne({
            where: {
              nafdac_number: nafdac_number,
              pharmacy: { id: pharmacy_id },
            },
          })
        : await this.pharmProductRepo.findOne({
            where: { product_code: product_code, pharmacy: { id: pharmacy_id } },
        });
    
    // if there is no existing record on pharmacy product with the NRN or product code
    if (!pharmProduct) {
      // create product with universal list product for the pharmacy
      pharmProduct = await this.takeStockOfExistingUniversalListProduct(
        user,
        pharmacy_id,
        nafdacNumberOrBarCode,
        quantity,
        selling_price,
        expiry_date,
        cost_price,
        quantity_type
      )
    }

    else {
      // operation permission
      if (!ability.can(Action.Update, pharmProduct)) {  // works on a user with Role.Pharmacist
        throw new HttpException("You do not have permissions to take stock product inventory for a pharmacy that does not belong to you.", HttpStatus.BAD_REQUEST)
      }

      pharmProduct.quantity = quantity;
      pharmProduct.quantity_type = quantity_type;
      pharmProduct.selling_price = selling_price;
      pharmProduct.expiry_date = expiry_date;
      pharmProduct.cost_price = cost_price;
      pharmProduct = await this.pharmProductRepo.save(pharmProduct);
      await this.updateOverallInventoryUpdateTimeForPharmacyInventory(pharmacy_id, pharmProduct.last_edited_at)
    }

    return pharmProduct;
  }


  async takeStockOfExistingUniversalListProduct(
    user: User,
    pharmacy_id: number,
    nafdacNumberOrBarCode: string,
    quantity: number,
    selling_price: number,
    expiry_date: Date,
    cost_price?: number,
    quantity_type?: QuantityTypes,
  ) {
    const ability = this.caslAbilityFactory.createForUser(user)

    const pharmacy = await this.pharmRepo.findOneBy({ id: pharmacy_id });
    if (!pharmacy) {
      throw new HttpException( 'Pharmacy with id does not exist', HttpStatus.NOT_FOUND);
    }
    const universalListProduct = await this.universalListService.getProductInUniversalList(nafdacNumberOrBarCode)

    let dosageFormKey: PharmacyProductDosageForm
    if (universalListProduct.dosage_form in PharmacyProductDosageForm) {
      dosageFormKey = PharmacyProductDosageForm[universalListProduct.dosage_form]
    }

    let pharmProduct = this.pharmProductRepo.create({
      nafdac_number: universalListProduct.nafdac_number,
      product_name: universalListProduct.product_name,
      product_code: universalListProduct.product_code,
      manufacturer: universalListProduct.manufacturer,
      strength: universalListProduct.strength,
      unit: universalListProduct.unit,
      dosage_form: dosageFormKey,
      exists_in_uni_list: true,
      quantity,
      quantity_type,
      selling_price,
      expiry_date,
      cost_price,
      pharmacy
    })

    // operation permission
    if (!ability.can(Action.Create, pharmProduct)) {  // works on a user with Role.Pharmacist
      throw new HttpException("You do not have permissions to take stock of product inventory for a pharmacy that does not belong to you.", HttpStatus.BAD_REQUEST)
    }

    pharmProduct = await this.pharmProductRepo.save(pharmProduct)
    await this.updateOverallInventoryUpdateTimeForPharmacyInventory(pharmacy_id, pharmProduct.last_edited_at)

    return pharmProduct
  }


  async editPharmacyNewProductDetails(
    // edit product that does not exist in the universal list
    user: User,
    pharmacy_id: number,
    entry_id: number,
    nafdac_number?: string,
    product_code?: string,
    product_name?: string,
    manufacturer?: string,
    dosage_form?: PharmacyProductDosageForm,
    strength?: string,
    unit?: string) {
    const ability = this.caslAbilityFactory.createForUser(user)
    
    const pharmacy = await this.pharmRepo.findOneBy({ id: pharmacy_id });
    if (!pharmacy) {
      throw new HttpException( 'Pharmacy with id does not exist', HttpStatus.NOT_FOUND);
    }

    let newProductEntry = await this.pharmProductRepo.findOne({ where: { id: entry_id, pharmacy: pharmacy, exists_in_uni_list: false  } })
    if (!newProductEntry) {
      throw new HttpException("Product entry with entry_id for pharmacy does not exist to be edited or product exists in the universal list.", HttpStatus.BAD_REQUEST)
    }

    // operation permission
    if (!ability.can(Action.Update, newProductEntry)) {  // works on a user with Role.Pharmacist
      throw new HttpException("You do not have permissions to edit product inventory for a pharmacy that does not belong to you.", HttpStatus.BAD_REQUEST)
    }
    
    newProductEntry.nafdac_number = nafdac_number != null ? nafdac_number : newProductEntry.nafdac_number
    newProductEntry.product_code  = product_code != null ? product_code : newProductEntry.product_code
    newProductEntry.product_name  = product_name != null ? product_name : newProductEntry.product_name
    newProductEntry.manufacturer  = manufacturer != null ? manufacturer : newProductEntry.manufacturer
    newProductEntry.dosage_form   = dosage_form != null ? dosage_form : newProductEntry.dosage_form
    newProductEntry.strength      = strength != null ? strength : newProductEntry.strength
    newProductEntry.unit          = unit != null ? unit: newProductEntry.unit
    
    newProductEntry = await this.pharmProductRepo.save(newProductEntry)
    await this.updateOverallInventoryUpdateTimeForPharmacyInventory(pharmacy_id, newProductEntry.last_edited_at)

    return {
      "message": "Entry edited",
      "entry": newProductEntry
    }
  }


  async searchPharmacyInventory(items: PharmacyProduct[], query: string) {
    let searchResults = []

    const regex = new RegExp(query, 'i'); // Create a case-insensitive regex with search query

    for (let item of items) {
      
      // if any of the regex match returns true with an item property
      if (
        regex.test(item.product_name) ||
        regex.test(item.manufacturer) ||
        regex.test(item.product_code) ||
        regex.test(item.nafdac_number)
      ) {
        searchResults.push(item)
      }
    }
    return searchResults
  }


  async fetchPharmacyInventory(pharmacy_id: number, user?:User, timeLapses?: TimeLapses, only_new?: boolean, startDate?: Date, endDate?: Date, query?: string) {
    const ability = this.caslAbilityFactory.createForUser(user)

    const pharmacy = await this.pharmRepo.findOneBy({ id: pharmacy_id });
    if (!pharmacy) {
      throw new HttpException( 'Pharmacy with id does not exist', HttpStatus.NOT_FOUND);
    }

    if (!ability.can(Action.Read, pharmacy)) {  // works on a user with Role.Pharmacist
      throw new HttpException("You do not have permissions to read products inventories for a pharmacy that does not belong to you.", HttpStatus.BAD_REQUEST)
    }

    let updatedTime = await this.getOverallInventoryUpdateTimeForPharmacyInventory(pharmacy_id)

    if (timeLapses == TimeLapses.TODAY) {
      if (user.role == Role.Admin && only_new == true) {
        const newProductEntries = await this.fetchPharmacyEntriesForToday(pharmacy, only_new)

        // if there is a search query, query the already retrieved results on only_new records
        if ( query && (newProductEntries instanceof Array) ) {  // the newProductsEntries variable returns a message dict or an Array. If it returns an Array data type, and a query is present, runs the search query function
          let searchResults = await this.searchPharmacyInventory(newProductEntries, query)
          return {
            metadata: {
              message: "Search results on today's new products for admin view",
              last_update: updatedTime
            },
            data: searchResults
          }
        }

        return {
          metadata: {
            message: "Today's new products for admin view",
            last_update: updatedTime
          },
          data: newProductEntries
        }
      }

      let pharmacyEntries = await this.fetchPharmacyEntriesForToday(pharmacy)
      if (query && (pharmacyEntries instanceof Array)) {
        let searchResults = await this.searchPharmacyInventory(pharmacyEntries, query)
        return {
          metadata: {
            last_update: updatedTime
          },
          data: searchResults
        }
      }

      return {
        metadata: {
          last_update: updatedTime
        },
        data: pharmacyEntries
      }
    }

    else if (timeLapses == TimeLapses.THIS_WEEK) {
      if (user.role == Role.Admin && only_new == true) {
        const newProductEntries = await this.fetchPharmacyEntriesForThisWeek(pharmacy, only_new)

        // if there is a search query, query the already retrieved results on only_new records
        if (query && (newProductEntries instanceof Array)) {
          let searchResults = await this.searchPharmacyInventory(newProductEntries, query)
          return {
            metadata: {
              message: "Search results on this week's new products for admin view",
              last_update: updatedTime
            },
            data: searchResults
          }
        }
        return {
          metadata: {
            message: "This week's new products for admin view",
            last_update: updatedTime
          },
          data: newProductEntries
        }
      }

      let pharmacyEntries = await this.fetchPharmacyEntriesForThisWeek(pharmacy)
      if (query && (pharmacyEntries instanceof Array)) {
        let searchResults = await this.searchPharmacyInventory(pharmacyEntries, query)
        return {
          metadata: {
            last_update: updatedTime
          },
          data: searchResults
        }
      }
      
      return {
        metadata: {
          last_update: updatedTime
        },
        data: pharmacyEntries
      }
    }

    else if (timeLapses == TimeLapses.THIS_MONTH) {
      if (user.role == Role.Admin && only_new == true) {
        const newProductEntries = await this.fetchPharmacyEntriesForThisMonth(pharmacy, only_new)

        // if there is a search query, query the already retrieved results on only_new records
        if (query && (newProductEntries instanceof Array)) {
          let searchResults = await this.searchPharmacyInventory(newProductEntries, query)
          return {
            metadata: {
              message: "Search results on this month's new products for admin view",
              last_update: updatedTime
            },
            data: searchResults
          }
        }

        return {
          metadata: {
            message: "This month's new products for admin view",
            last_update: updatedTime
          },
          data: newProductEntries
        }
      }

      let pharmacyEntries = await this.fetchPharmacyEntriesForThisMonth(pharmacy)
      if (query && (pharmacyEntries instanceof Array)) {
        let searchResults = await this.searchPharmacyInventory(pharmacyEntries, query)
        return {
          metadata: {
            last_update: updatedTime
          },
          data: searchResults
        }
      }

      return {
        metadata: {
          last_update: updatedTime
        },
        data: pharmacyEntries
      }
    }

    else if (timeLapses == TimeLapses.LAST_3_MONTH) {
      if (user.role == Role.Admin && only_new == true) {
        const newProductEntries = await this.fetchPharmacyEntriesForTheLastThreeMonths(pharmacy, only_new)

        // if there is a search query, query the already retrieved results on only_new records
        if (query && (newProductEntries instanceof Array)) {
          let searchResults = await this.searchPharmacyInventory(newProductEntries, query)
          return {
            metadata: {
              message: "Search results on last 3 months' new products for admin view",
              last_update: updatedTime
            },
            data: searchResults
          }
        }

        return {
          metadata: {
            message: "Last 3 months' new products for admin view",
            last_update: updatedTime
          },
          data: newProductEntries
        }
      }

      let pharmacyEntries = await this.fetchPharmacyEntriesForTheLastThreeMonths(pharmacy)
      if (query && (pharmacyEntries instanceof Array)) {
        let searchResults = await this.searchPharmacyInventory(pharmacyEntries, query)
        return {
          metadata: {
            last_update: updatedTime
          },
          data: searchResults
        }
      }

      return {
        metadata: {
          last_update: updatedTime
        },
        data: pharmacyEntries
      }
    }

    else if (timeLapses == TimeLapses.CUSTOM_DATES) {
      if (!startDate || !endDate) {
        throw new HttpException("Invalid request on fetching inventory with custom date option. Please input start and end dates.", HttpStatus.BAD_REQUEST)
      }

      if (user.role == Role.Admin && only_new == true) {
        const newProductEntries = await this.fetchPharmacyEntriesByCustomDates(pharmacy, startDate, endDate, only_new)

        // if there is a search query, query the already retrieved results on only_new records
        if (query && (newProductEntries instanceof Array)) {
          let searchResults = await this.searchPharmacyInventory(newProductEntries, query)
          return {
            metadata: {
              message: "Search results on custom dates of new products for admin view",
              last_update: updatedTime
            },
            data: searchResults
          }
        }

        return {
          metadata: {
            message: "Custom dates new products for admin view",
            last_update: updatedTime
          },
          data: newProductEntries
        }
      }

      let pharmacyEntries = await this.fetchPharmacyEntriesByCustomDates(pharmacy, startDate, endDate)
      if (query && (pharmacyEntries instanceof Array)) {
        let searchResults = await this.searchPharmacyInventory(pharmacyEntries, query)
        return {
          metadata: {
            last_update: updatedTime
          },
          data: searchResults
        }
      }

      return {
        metadata: {
          last_update: updatedTime
        },
        data: pharmacyEntries
      }
    }

    // default response if there is a search query
    let pharmacyEntries = await this.pharmProductRepo.findBy({ pharmacy: pharmacy })
    if (query && (pharmacyEntries instanceof Array)) {
      let searchResults = await this.searchPharmacyInventory(pharmacyEntries, query)
      return {
        metadata: {
          last_update: updatedTime
        },
        data: searchResults
      }
    }

    // default response
    return {
      metadata: {
        last_update: updatedTime
      },
      data: pharmacyEntries
    }
  }


  // fetches entries for today for the agent.
  // also fetches entries that don't exist in the universal list
  async fetchPharmacyEntriesForToday(pharmacy: Pharmacy, only_new?: boolean) {
    // only_new parameter is used to fetch pharmacy products that don't exist in the universal list
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based
    const currentDay = currentDate.getDate();

    let pharmacyEntries = only_new == true ? await this.pharmProductRepo.find({ where: { pharmacy: pharmacy, exists_in_uni_list: false } }) : await this.pharmProductRepo.find({ where: { pharmacy: pharmacy } })
    // selecting entries with today's date
    let pharmacyEntriesForToday = pharmacyEntries.filter((item) => {
      let date = new Date(item.stock_taken_at);
      const givenYear = date.getFullYear();
      const givenMonth = date.getMonth() + 1; // Months are zero-based
      const givenDay = date.getDate();

      return currentYear === givenYear && currentMonth === givenMonth && currentDay === givenDay
    })

    if (pharmacyEntriesForToday.length) {
      return pharmacyEntriesForToday
    }

    return { message: "No entries for today found" }
    
  }


  async getDatesOfCurrentWeek() {
    const today = new Date()
    console.log("current day: ", today)
    const currentDayOfWeek = today.getDay()
    const firstDayOfWeek = new Date(today)

    // Adjust to the first day of the week (assuming Sunday is the first day)
    firstDayOfWeek.setDate(today.getDate() - currentDayOfWeek);

    // Generate the dates for the current week
    const datesOfCurrentWeek: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(firstDayOfWeek);
        date.setDate(firstDayOfWeek.getDate() + i);
        datesOfCurrentWeek.push(date);
    }

    return datesOfCurrentWeek;
  }


  formatDate(date: Date) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  // fetches entries for today for the agent.
  // also fetches entries that don't exist in the universal list
  async fetchPharmacyEntriesForThisWeek(pharmacy: Pharmacy, only_new?: boolean) {

    const datesOfCurrentWeek = await this.getDatesOfCurrentWeek();
    const formattedDatesOfCurrentWeek = datesOfCurrentWeek.map(date => this.formatDate(date));
    console.log("formatted current week dates strings: ", formattedDatesOfCurrentWeek)

    let pharmacyEntries = only_new == true ? await this.pharmProductRepo.find({ where: { pharmacy: pharmacy, exists_in_uni_list: false } }) : await this.pharmProductRepo.find({ where: { pharmacy: pharmacy } })
    let thisWeekPharmacyEntries = pharmacyEntries.filter(item => {
      let itemDateString = item['stock_taken_at'].toISOString()
      let itemDatePart = itemDateString.split('T')[0];
      return formattedDatesOfCurrentWeek.includes(itemDatePart);
    })


    if (thisWeekPharmacyEntries.length) {
      return thisWeekPharmacyEntries
    }

    return {
      message: "No entries for this week found"
    }
  }


  async fetchPharmacyEntriesForThisMonth(pharmacy: Pharmacy, only_new?: boolean) {
    const currentDate = new Date()

    // getMonth(): Returns the month (0-11) for the specified date according to local time. 
    // Since it returns a zero - based index(January is 0, February is 1, and so on), 
    // you add 1 to get the 1 - based month number.
    let currentMonth = currentDate.getMonth() + 1
    console.log("Current month number: ", currentMonth)

    let pharmacyEntries = only_new == true ? await this.pharmProductRepo.find({ where: { pharmacy: pharmacy, exists_in_uni_list: false } }) : await this.pharmProductRepo.find({ where: { pharmacy: pharmacy } })

    // creating an array of items that have current month number
    let pharmacyEntriesThisMonth = pharmacyEntries.filter((item) => {
      let itemStockMonth = new Date(item.stock_taken_at).getMonth() + 1;
      return currentMonth === itemStockMonth;
    });

    if (pharmacyEntriesThisMonth.length) {
      return pharmacyEntriesThisMonth
    }
  
    return {
      message: "No entries for this month found"
    }
  }


  async fetchPharmacyEntriesForTheLastThreeMonths(pharmacy: Pharmacy, only_new?: boolean) {
    const currentDate = new Date()

    // getMonth(): Returns the month (0-11) for the specified date according to local time. 
    // Since it returns a zero - based index(January is 0, February is 1, and so on), 
    // you add 1 to get the 1 - based month number.
    let currentMonth = currentDate.getMonth() + 1
    console.log("Current month number: ", currentMonth)

    let pharmacyEntries = only_new == true ? await this.pharmProductRepo.find({ where: { pharmacy: pharmacy, exists_in_uni_list: false } }) : await this.pharmProductRepo.find({ where: { pharmacy: pharmacy } })

    // creating an array of items that have month number greater or equal to (3 months behind the current month) 
    let pharmacyEntriesInLastThreeMonths = pharmacyEntries.filter((item) => {
      let itemStockMonth = new Date(item.stock_taken_at).getMonth() + 1;
      console.log("product stock month number: ", itemStockMonth)
      return itemStockMonth >= (currentMonth - 3);

    });

    if (pharmacyEntriesInLastThreeMonths.length) {
      return pharmacyEntriesInLastThreeMonths
    }
    
    return {
      message: "No entries for the past 3 months found"
    }
  }


  async fetchPharmacyEntriesByCustomDates(pharmacy: Pharmacy, startDate: Date, endDate: Date, only_new?: boolean) {

    let pharmacyEntries = only_new == true ? await this.pharmProductRepo.find({ where: { pharmacy: pharmacy, exists_in_uni_list: false } }) : await this.pharmProductRepo.find({ where: { pharmacy: pharmacy } })

    let customFetchPharmacyEntries = pharmacyEntries.filter(item => {
      let itemDate = new Date(item.stock_taken_at);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    })

    if (customFetchPharmacyEntries.length) {
      return customFetchPharmacyEntries
    }

    return {
      message: "No results or invalid date fields set."
    }
  }


  // this is only accessible by Admin and Agents to delete a pharmacy inventory
  async deletePharmacyEntry(pharmacy_id: number, entry_id: number) {
    let pharmProduct = await this.pharmProductRepo.findOne({
      where: {
        id: entry_id,
        pharmacy: { id: pharmacy_id },
      },
    })

    if (!pharmProduct) {
      throw new HttpException("Non-existing entry", HttpStatus.BAD_REQUEST)
    }

    await this.pharmProductRepo.remove(pharmProduct)
    throw new HttpException("No content: Deleted", HttpStatus.NO_CONTENT)
  }
}
