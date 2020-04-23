interface JSON {
  parse(text: string | Buffer, reviver?: (key: any, value: any) => any): any
}

interface SharedState {
  [p: string]: string
}
