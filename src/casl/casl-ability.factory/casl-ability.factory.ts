import { User } from "../../users/user.entity";
import { Pharmacy } from "../../pharmacies/entities/pharmacy.entity";
import { PharmacyProduct } from "../../pharmacies/entities/pharamcy.product.entity";
import { InferSubjects, createMongoAbility, MongoQuery, MongoAbility,  AbilityBuilder, ExtractSubjectType } from '@casl/ability'
import { Action } from "../../enums/actions.enums";
import { Role } from "../../enums/role.enum";

type Subjects = InferSubjects<typeof Pharmacy | typeof PharmacyProduct | typeof User> | 'all';

type PossibleAbilities = [Action, Subjects]
type Conditions = MongoQuery

// this is used to access nested Pharmacy attributes in PharmacyProduct entity
type FlatPharmacyProduct = PharmacyProduct & {
  'pharmacy.emailAddress': PharmacyProduct['pharmacy']['emailAddress']
}

export type AppAbility = MongoAbility<PossibleAbilities, Conditions>

export class CaslAbilityFactory { 
  
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role == Role.Admin) {
      can(Action.Manage, 'all')
      }
    
    if (user.role == Role.Agent) {
      can(Action.Create, PharmacyProduct)
      can(Action.Update, PharmacyProduct)
      can(Action.Read, PharmacyProduct)

      // permission to read data related to a Pharmacy. example: read pharmacy inventory
      can(Action.Read, Pharmacy)
    }
    
    if (user.role === Role.Pharmacist) {
      can<FlatPharmacyProduct>(Action.Update, PharmacyProduct, { 'pharmacy.emailAddress': user.email });
      can<FlatPharmacyProduct>(Action.Create, PharmacyProduct, { 'pharmacy.emailAddress': user.email });
      can<FlatPharmacyProduct>(Action.Read, PharmacyProduct, { 'pharmacy.emailAddress': user.email });

      // permission to read data related to a Pharmacy. example: read pharmacy inventory
      can(Action.Read, Pharmacy, {emailAddress: user.email})
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
