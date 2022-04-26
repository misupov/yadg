export interface YadgTheme extends Partial<CSSStyleDeclaration> {
  header?: Partial<CSSStyleDeclaration>;
  viewport?: Partial<CSSStyleDeclaration>;
  scrollPane?: Partial<CSSStyleDeclaration>;
}

export interface YadgColumn {
  field: string;
  title?: string;
}

export interface GridOptions {
  columns: YadgColumn[];
  data: any[];
  theme?: YadgTheme;
}
