import _ from 'lodash'

export const fields = [
  'npi',
  'provider_type',
  'replacement_npi',
  'ein',

  'profile.title',
  'profile.last_name',
  'profile.first_name',
  'profile.middle_name',
  'profile.prefix',
  'profile.suffix',
  'profile.credential_text',

  'profile_other.name',
  'profile_other.name_type_code',
  'profile_other.last_name',
  'profile_other.last_name_type_code',
  'profile_other.first_name',
  'profile_other.middle_name',
  'profile_other.prefix',
  'profile_other.suffix',
  'profile_other.credential_text',

  'mailing_location.address1',
  'mailing_location.address2',
  'mailing_location.city',
  'mailing_location.state',
  'mailing_location.zip',
  'mailing_location.country_code',
  'mailing_location.phone',
  'mailing_location.fax',

  'practice_location.address1',
  'practice_location.address2',
  'practice_location.city',
  'practice_location.state',
  'practice_location.zip',
  'practice_location.country_code',
  'practice_location.phone',
  'practice_location.fax',

  'updated_date',
  'npi_deactivation_reason',
  'npi_deactivation_date',
  'npi_reactivation_date',
  'gender',

  'authorized_official.last_name',
  'authorized_official.first_name',
  'authorized_official.middle_name',
  'authorized_official.position',
  'authorized_official.phone',
  'authorized_official.prefix',
  'authorized_official.suffix',
  'authorized_official.credential_text',
  // ...flatArrayStub('taxonomy_codes',
  //   ['taxonomy_code', 'license_number', 'license_number_state_code', 'primary_taxonomy_switch'], 15),
  // ...flatArrayStub('other_provider_identifiers', ['identifier', 'type_code', 'state', 'issuer'], 50),

  'is_sole_proprietor',
  'is_organization_subpart',
  'parent_organization_lbn',
  'parent_organization_tin',
  // 'taxonomy_groups',
  'certification_date',
  'is_active',
  'details',
  'image_file_name',
  'latitude',
  'longitude',
  'email',
  'mobile_phone',
  'is_safe_physician',
  'logo_file_name',
  'source_type',
]

export default row => {
  const convertedRow = {}
  _.each(fields, f => {
    convertedRow[f] = getCMSData(f, row)
  })
  return convertedRow
}

function getCMSData(field, row) {
  const mapper = {
    npi: r => Number(r.npi),
    provider_type: r => Number(r.entity_type_code),
    replacement_npi: r => Number(r.replacement_npi),
    ein: r => (r.employer_identification_number_ein === '<UNAVAIL>' ? '' : r.employer_identification_number_ein),

    'profile.title': r => r.provider_organization_name_legal_business_name,
    'profile.last_name': r => r.provider_last_name_legal_name,
    'profile.first_name': r => r.provider_first_name,
    'profile.middle_name': r => r.provider_middle_name,
    'profile.prefix': r => r.provider_name_prefix_text,
    'profile.suffix': r => r.provider_name_suffix_text,
    'profile.credential_text': r => r.provider_credential_text,

    'profile_other.name': r => r.provider_other_organization_name,
    'profile_other.name_type_code': r => r.provider_other_organization_name_type_code,
    'profile_other.last_name': r => r.provider_other_last_name,
    'profile_other.last_name_type_code': r => r.provider_other_last_name_type_code,
    'profile_other.first_name': r => r.provider_other_first_name,
    'profile_other.middle_name': r => r.provider_other_middle_name,
    'profile_other.prefix': r => r.provider_other_name_prefix_text,
    'profile_other.suffix': r => r.provider_other_name_suffix_text,
    'profile_other.credential_text': r => r.provider_other_credential_text,

    'mailing_location.address1': r => r.provider_first_line_business_mailing_address,
    'mailing_location.address2': r => r.provider_second_line_business_mailing_address,
    'mailing_location.city': r => r.provider_business_mailing_address_city_name,
    'mailing_location.state': r => r.provider_business_mailing_address_state_name,
    'mailing_location.zip': r => r.provider_business_mailing_address_postal_code,
    'mailing_location.country_code': r => r.provider_business_mailing_address_country_code_if_outside_us,
    'mailing_location.phone': r => r.provider_business_mailing_address_telephone_number,
    'mailing_location.fax': r => r.provider_business_mailing_address_fax_number,

    'practice_location.address1': r => r.provider_first_line_business_practice_location_address,
    'practice_location.address2': r => r.provider_second_line_business_practice_location_address,
    'practice_location.city': r => r.provider_business_practice_location_address_city_name,
    'practice_location.state': r => r.provider_business_practice_location_address_state_name,
    'practice_location.zip': r => r.provider_business_practice_location_address_postal_code,
    'practice_location.country_code': r => r.provider_business_practice_location_address_country_code_if_outside_us,
    'practice_location.phone': r => r.provider_business_practice_location_address_telephone_number,
    'practice_location.fax': r => r.provider_business_practice_location_address_fax_number,

    enumeration_date: r => r.provider_enumeration_date,
    updated_date: r => r.last_update_date,
    npi_deactivation_reason: r => r.npi_deactivation_reason_code,
    npi_deactivation_date: r => r.npi_deactivation_date,
    npi_reactivation_date: r => r.npi_reactivation_date,
    gender: r => r.provider_gender_code,

    'authorized_official.last_name': r => r.authorized_official_last_name,
    'authorized_official.first_name': r => r.authorized_official_first_name,
    'authorized_official.middle_name': r => r.authorized_official_middle_name,
    'authorized_official.position': r => r.authorized_official_title_or_position,
    'authorized_official.phone': r => r.authorized_official_telephone_number,
    'authorized_official.prefix': r => r.authorized_official_name_prefix_text,
    'authorized_official.suffix': r => r.authorized_official_name_suffix_text,
    'authorized_official.credential_text': r => r.authorized_official_credential_text,

    // ...createArrayFromModel(row, 'taxonomy_codes', {
    //   taxonomy_code: 'healthcare_provider_taxonomy_code',
    //   license_number: 'provider_license_number',
    //   license_number_state_code: 'provider_license_number_state_code',
    //   primary_taxonomy_switch: 'healthcare_provider_primary_taxonomy_switch',
    // }, 15),
    // ...createArrayFromModel(row, 'other_provider_identifiers', {
    //   identifier: 'other_provider_identifier',
    //   type_code: 'other_provider_identifier_type_code',
    //   state: 'other_provider_identifier_state',
    //   issuer: 'other_provider_identifier_issuer',
    // }, 50),
    is_sole_proprietor: r => convertXYN(r.is_sole_proprietor),
    is_organization_subpart: r => convertXYN(r.is_organization_subpart),
    parent_organization_lbn: r => r.parent_organization_lbn,
    parent_organization_tin: r => r.parent_organization_tin,
    // taxonomy_groups: r => createArrayFromField(r, 'healthcare_provider_taxonomy_group', 15),
    certification_date: r => r.certification_date,

    is_active: true,
    details: '',
    logo_file_name: '',
    image_file_name: '',
    latitude: 0,
    longitude: 0,
    email: '',
    mobile_phone: '',
    is_safe_physician: false,
    source_type: 1,
  }

  if (_.isUndefined(mapper[field])) return ''
  return _.isFunction(mapper[field]) ? mapper[field](row) : mapper[field]
}

function convertXYN(value) {
  return value === 'Y'
}

function createArrayFromField(row, field, count) {
  const results = [] as any
  for (let i = 1; i <= count; i++) {
    results.push(row[`${field}${i}`])
  }
  return _.compact(results)
}

function createArrayFromModel(row, field, model, count) {
  const results = {}
  for (let i = 1; i <= count; i++) {
    for (let key in model) {
      if (row[`${model[key]}${count}`]) {
        console.log(row[`${model[key]}${count}`])
      }
      results[`${field}.${i}.${key}`] = row[`${model[key]}${count}`] || ''
    }
  }
  return results
}

function flatArrayStub(key, values, count) {
  const f = [] as any
  for (let i = 1; i <= count; i++) {
    _.each(values, v => {
      f.push(`${key}.${i}.${v}`)
    })
  }
  return f
}
