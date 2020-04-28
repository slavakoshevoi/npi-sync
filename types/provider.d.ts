interface Provider {
  npi: number
  provider_type: ProviderType
  replacement_npi: number
  ein: string
  profile: ProviderProfile
  profile_other: ProviderProfileOther
  mailing_location: ProviderLocation
  practice_location: ProviderLocation
  enumeration_date: ProviderDate | null
  updated_date: ProviderDate | null
  npi_deactivation_reason: string
  npi_deactivation_date: ProviderDate | null
  npi_reactivation_date: ProviderDate | null
  gender: string
  authorized_official: ProviderAuthorizedOfficial
  licenses: ProviderLicense[]
  other_provider_identifiers: ProviderOtherIdentifiers[]
  is_sole_proprietor: boolean
  is_organization_subpart: boolean
  parent_organization_lbn: string
  parent_organization_tin: string
  taxonomy_groups: string[]
  certification_date: ProviderDate | null
  educations: ProviderEducation[]
  insurances: ProviderInsurance[]
  ratings: ProviderRating[]
  specialties: ProviderSpeciality[]
  details: string
  logo_file_name: string
  image_file_name: string
  latitude: number
  longitude: number
  is_active: boolean
  is_safe_physician: boolean
  source_id: SOURCES_ENUM
}

interface ProviderProfile {
  title: string
  last_name: string
  first_name: string
  middle_name: string
  prefix: string
  suffix: string
  credential_text: string
  languages: ProviderProfileLanguage[]
  image_url: string
  email: string
  mobile_phone: string
}

interface ProviderProfileOther {
  name: string
  name_type_code: string
  last_name: string
  last_name_type_code: string
  first_name: string
  middle_name: string
  prefix: string
  suffix: string
  credential_text: string
}

interface ProviderLocation {
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country_code: string
  phone: string
  fax: string
}

interface ProviderAuthorizedOfficial {
  last_name: string
  first_name: string
  middle_name: string
  position: string
  phone: string
  prefix: string
  suffix: string
  credential_text: string
}

interface ProviderLicense {
  taxonomy_code: string
  primary_taxonomy_switch: boolean
  number: number
  state_code: string
}

interface ProviderOtherIdentifiers {
  identifier: string
  type_code: string
  state: string
  issuer: string
}

interface ProviderSpeciality {
  name: string
  description: string
  category: string
}

interface ProviderInsurance {
  provider_name: string
  plan_name: string
  plan_program_types: string[]
  plan_categories: string[]
}

interface ProviderEducation {
  degree: string
  school: string
}

interface ProviderRating {
  provider: string
  active: boolean
  rating: number
  review_count: number
  image_url_small: string
  image_url_large: string
}

interface ProviderProfileLanguage {
  name: string
  code: string
}

interface ProviderDate {
  $date: string
}

type ProviderType = 'INDIVIDUAL' | 'ORGANIZATION' | null

enum SOURCES_ENUM {
  CMS= 1,
  BETTER_DOCTOR= 2
}
