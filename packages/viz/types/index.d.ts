export {}

export const graphvizVersion: string

export const formats: string[]

export const engines: string[]

export function instance(): Promise<Viz>

declare class Viz {
  get graphvizVersion(): string
  get formats(): string[]
  get engines(): string[]
  render(input: string | Graph, options?: RenderOptions): RenderResult
  renderFormats(input: string | Graph, formats: string[], options?: RenderOptions): MultipleRenderResult
  renderString(input: string | Graph, options?: RenderOptions): string
  renderSVGElement(input: string | Graph, options?: RenderOptions): SVGSVGElement
  renderJSON(input: string | Graph, options?: RenderOptions): object
}

export { type Viz }

export interface RenderOptions {
  format?: string
  engine?: string
  yInvert?: boolean
  reduce?: boolean
  graphAttributes?: Attributes
  nodeAttributes?: Attributes
  edgeAttributes?: Attributes
  images?: ImageSize[]
}

export type RenderResult = SuccessResult | FailureResult

interface SuccessResult {
  status: "success"
  output: string
  errors: RenderError[]
}

interface FailureResult {
  status: "failure"
  output: undefined
  errors: RenderError[]
}

export type MultipleRenderResult = MultipleSuccessResult | FailureResult

interface MultipleSuccessResult {
  status: "success"
  output: { [format: string]: string }
  errors: RenderError[]
}

export interface RenderError {
  level?: "error" | "warning"
  message: string
}

export interface Graph {
  name?: string
  strict?: boolean
  directed?: boolean
  graphAttributes?: Attributes
  nodeAttributes?: Attributes
  edgeAttributes?: Attributes
  nodes?: Node[]
  edges?: Edge[]
  subgraphs?: Subgraph[]
}

interface Attributes {
  [name: string]: string | number | boolean | HTMLString
}

interface HTMLString {
  html: string
}

interface Node {
  name: string
  attributes?: Attributes
}

interface Edge {
  tail: string
  head: string
  attributes?: Attributes
}

interface Subgraph {
  name?: string
  graphAttributes?: Attributes
  nodeAttributes?: Attributes
  edgeAttributes?: Attributes
  nodes?: Node[]
  edges?: Edge[]
  subgraphs?: Subgraph[]
}

interface ImageSize {
  name: string,
  width: string | number,
  height: string | number
}
