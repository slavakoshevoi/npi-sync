const {
  NODE_ENV,
  HARD_UPDATE,
} = process.env || {}

const env = NODE_ENV || 'development'

const common = {
  env,
  HARD_UPDATE,
  npiFilesUrl: 'https://download.cms.gov/nppes',
  npiFilesParseUrl: 'https://download.cms.gov/nppes/NPI_Files.html',
  mongoDbConnectionString: 'mongodb://localhost:27017/providers',
  mongoDbCollection: 'providers',
  downloadedFilesDir: './data',
  dataFileNameXlsx: 'data.xlsx',
  dataFileNameJson: 'data.json',
  dataFileNameCsv: 'data.csv',
  headerFileNameCsv: 'data_header.csv',
  fieldNameFile: 'data_fields.txt',
}

export default common
