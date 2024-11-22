import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Pharmacy } from '../pharmacies/entities/pharmacy.entity';
import { UniversalList } from '../universal-list/universal-list.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SearchService {
  constructor(
    private dataSource: DataSource
  ) { }
  
  async searchPharmacies(searchQuery: string) {
    let pharmacies = await this.dataSource
      .createQueryBuilder()
      .select("pharmacy")
      .from(Pharmacy, "pharmacy").where("pharmacy.name ILIKE :searchQuery", { searchQuery: `%${searchQuery}%` })
      .getMany()
    
    if (pharmacies.length) {
      return pharmacies
    }
    return {
      "message": "No results found."
    }
  }


  async searchUniversalListProduct(searchQuery: string) {
    // this is implemented because of steve's suggestion to search for 
    // universal list products with queried NRN from 3rd or 4th character

    searchQuery = searchQuery.trim() // trimming out extra space character at the end, to avoid cases like "A4- "
    if (searchQuery.length < 4) {
      throw new HttpException("So many results, add more characters for better filtering", HttpStatus.BAD_REQUEST)
    }
    let universalListProducts = await this.dataSource
      .createQueryBuilder()
      .select("universal_list")
      .from(UniversalList, "universal_list").where("universal_list.nafdac_number ILIKE :searchQuery", { searchQuery: `%${searchQuery}%` })
      .getMany()
    
    if (universalListProducts.length) {
      return universalListProducts
    }
    return {
      "message": "No results found"
    }
  }
}
