export class CreatePdfGenerationDto {
  template: string; // The name of the template to use (e.g., 'quotation')
  data: Record<string, any>; // The data to populate the template with
}
