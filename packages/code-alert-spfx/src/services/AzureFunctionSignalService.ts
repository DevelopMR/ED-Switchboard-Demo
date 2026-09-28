export interface AzureFunctionSignalServiceOptions {
  endpointUrl: string;
  functionKey: string;
  originatorId: string;
  switchboardId: string;
}

export interface IntakeSignalInput {
  requestItemId: number;
  requestId: string;
}

export interface IntakeSignalResult {
  status?: string;
  intakeStatus?: string;
  secureAlertId?: string;
  errorCode?: string;
  message?: string;
  correlationId?: string;
}

export class AzureFunctionSignalService {
  public constructor(private readonly options: AzureFunctionSignalServiceOptions) {}

  public get isConfigured(): boolean {
    return Boolean(this.options.endpointUrl?.trim() && this.options.functionKey?.trim());
  }

  public async sendIntakeSignal(input: IntakeSignalInput): Promise<IntakeSignalResult> {
    if (!this.isConfigured) {
      return {
        status: "Skipped",
        intakeStatus: "Received",
        message: "Azure Function signal endpoint is not configured."
      };
    }

    const response = await fetch(this.buildUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requestItemId: input.requestItemId,
        requestId: input.requestId,
        originatorId: this.options.originatorId,
        switchboardId: this.options.switchboardId
      })
    });

    const result = (await readJson(response)) as IntakeSignalResult;
    if (!response.ok) {
      const safeMessage = result?.message || `Azure Function signal returned ${response.status}.`;
      throw new Error(safeMessage);
    }

    return result;
  }

  private buildUrl(): string {
    const url = new URL(this.options.endpointUrl.trim());
    url.searchParams.set("code", this.options.functionKey.trim());
    return url.toString();
  }
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
