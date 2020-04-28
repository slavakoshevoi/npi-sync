import _ from 'lodash'
import moment from 'moment'
import { N } from '.'

export default row => getCMSData(row)

function getCMSData(row) {
  const mapper: Provider = {
    npi: N(row.npi),
    provider_type: getProviderType(N(row.entity_type_code)),
    replacement_npi: N(row.replacement_npi),
    ein: row.employer_identification_number_ein === '<UNAVAIL>' ? '' : row.employer_identification_number_ein,
    profile: {
      title: row.provider_organization_name_legal_business_name,
      last_name: row.provider_last_name_legal_name,
      first_name: row.provider_first_name,
      middle_name: row.provider_middle_name,
      prefix: row.provider_name_prefix_text,
      suffix: row.provider_name_suffix_text,
      credential_text: row.provider_credential_text,
      languages: [],
      image_url: '',
      email: '',
      mobile_phone: '',
    },
    profile_other: {
      name: row.provider_other_organization_name,
      name_type_code: row.provider_other_organization_name_type_code,
      last_name: row.provider_other_last_name,
      last_name_type_code: row.provider_other_last_name_type_code,
      first_name: row.provider_other_first_name,
      middle_name: row.provider_other_middle_name,
      prefix: row.provider_other_name_prefix_text,
      suffix: row.provider_other_name_suffix_text,
      credential_text: row.provider_other_credential_text,
    },
    mailing_location: {
      address1: row.provider_first_line_business_mailing_address,
      address2: row.provider_second_line_business_mailing_address,
      city: row.provider_business_mailing_address_city_name,
      state: row.provider_business_mailing_address_state_name,
      zip: row.provider_business_mailing_address_postal_code,
      country_code: row.provider_business_mailing_address_country_code_if_outside_us,
      phone: row.provider_business_mailing_address_telephone_number,
      fax: row.provider_business_mailing_address_fax_number,
    },
    practice_location: {
      address1: row.provider_first_line_business_practice_location_address,
      address2: row.provider_second_line_business_practice_location_address,
      city: row.provider_business_practice_location_address_city_name,
      state: row.provider_business_practice_location_address_state_name,
      zip: row.provider_business_practice_location_address_postal_code,
      country_code: row.provider_business_practice_location_address_country_code_if_outside_us,
      phone: row.provider_business_practice_location_address_telephone_number,
      fax: row.provider_business_practice_location_address_fax_number,
    },
    enumeration_date: convertDate(row.provider_enumeration_date),
    updated_date: convertDate(row.last_update_date),
    npi_deactivation_reason: row.npi_deactivation_reason_code,
    npi_deactivation_date: convertDate(row.npi_deactivation_date),
    npi_reactivation_date: convertDate(row.npi_reactivation_date),
    gender: row.provider_gender_code,
    authorized_official: {
      last_name: row.authorized_official_last_name,
      first_name: row.authorized_official_first_name,
      middle_name: row.authorized_official_middle_name,
      position: row.authorized_official_title_or_position,
      phone: row.authorized_official_telephone_number,
      prefix: row.authorized_official_name_prefix_text,
      suffix: row.authorized_official_name_suffix_text,
      credential_text: row.authorized_official_credential_text,
    },

    licenses: createArrayFromModel({
      taxonomy_code: i => row[`healthcare_provider_taxonomy_code${i}`],
      primary_taxonomy_switch: i => convertXYN(row[`healthcare_provider_primary_taxonomy_switch${i}`]),
      number: i => N(row[`provider_license_number${i}`]),
      state_code: i => row[`provider_license_number_state_code${i}`],
    }, 15),
    other_provider_identifiers: createArrayFromModel({
      identifier: i => row[`other_provider_identifier${i}`],
      type_code: i => row[`other_provider_identifier_type_code${i}`],
      state: i => row[`other_provider_identifier_state${i}`],
      issuer: i => row[`other_provider_identifier_issuer${i}`],
    }, 50),
    is_sole_proprietor: convertXYN(row.is_sole_proprietor),
    is_organization_subpart: convertXYN(row.is_organization_subpart),
    parent_organization_lbn: row.parent_organization_lbn,
    parent_organization_tin: row.parent_organization_tin,
    taxonomy_groups: createArrayFromField(row, 'healthcare_provider_taxonomy_group', 15),
    certification_date: convertDate(row.certification_date),
    educations: [],
    insurances: [],
    ratings: [],
    specialties: [],
    details: '',
    logo_file_name: '',
    image_file_name: '',
    latitude: 0,
    longitude: 0,
    is_active: true,
    is_safe_physician: false,
    source_id: 1,
  }

  return mapper
}

function convertXYN(value) {
  return value === 'Y'
}

export function convertDate(value) {
  const date = moment(value, 'MM/DD/YYYY').toISOString()
  return date ? { $date: date } : null
}

function createArrayFromField(row, field, count) {
  const results = [] as any
  for (let i = 1; i <= count; i++) {
    results.push(row[`${field}${i}`])
  }
  return _.compact(results)
}

function createArrayFromModel(model, count) {
  const results = [] as any
  for (let i = 1; i <= count; i++) {
    const obj = {}
    for (let key in model) {
      obj[key] = model[key](i)
    }
    if (_.compact(_.values(obj)).length) results.push(obj)
  }
  return results
}

function getProviderType(value) {
  if (value === 1) return 'INDIVIDUAL'
  if (value === 2) return 'ORGANIZATION'
  return null
}
