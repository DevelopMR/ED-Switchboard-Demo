import { CodeAlertWorkflowDefinitionSource } from "./CodeAlertWorkflowDefinitionSource";

export interface CodeAlertActionSchema {
  actions: string[];
}

export interface CodeAlertFormFieldSchema {
  name: string;
  type: "Text" | "MultilineText" | "Boolean";
  required?: boolean;
}

export interface CodeAlertFormSchema {
  fields: CodeAlertFormFieldSchema[];
}

export interface CodeAlertWorkflowDefinition extends CodeAlertWorkflowDefinitionSource {
  id?: number;
  actionSchema: CodeAlertActionSchema;
  formSchema: CodeAlertFormSchema;
}
