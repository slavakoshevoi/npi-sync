const {
  NODE_ENV,
} = process.env || {}

const env = NODE_ENV || 'development'

const common = {
  env,
  npiFilesUrl: 'https://download.cms.gov/nppes',
  npiFilesParseUrl: 'https://download.cms.gov/nppes/NPI_Files.html',
}

export default common
