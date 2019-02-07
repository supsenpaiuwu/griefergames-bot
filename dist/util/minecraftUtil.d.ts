interface JsonChat {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underlined?: boolean;
    strikethrough?: boolean;
    obfuscated?: boolean;
    color?: string;
    extra?: JsonChat[];
    [key: string]: any;
}
declare function jsonToCodedText(item: JsonChat | JsonChat[]): string;
declare function jsonToText(item: JsonChat | JsonChat[]): string;
declare function stripCodes(text: string): string;
export { jsonToText, jsonToCodedText, stripCodes };
