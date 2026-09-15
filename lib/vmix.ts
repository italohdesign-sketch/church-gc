export type VmixCommand = {
  function: string;
  input?: string;
  selectedName?: string;
  value?: string;
};

export function buildVmixUrl(host: string, command: VmixCommand) {
  const url = new URL(`http://${host}:8088/api/`);
  url.searchParams.set("Function", command.function);
  if (command.input) url.searchParams.set("Input", command.input);
  if (command.selectedName) url.searchParams.set("SelectedName", command.selectedName);
  if (command.value) url.searchParams.set("Value", command.value);
  return url.toString();
}

export async function sendVmixCommand(host: string, command: VmixCommand) {
  const response = await fetch(buildVmixUrl(host, command), { method: "GET" });
  if (!response.ok) throw new Error(`vMix respondeu ${response.status}`);
  return response.text();
}

export const vmix = {
  setText: (host: string, input: string, field: string, value: string) =>
    sendVmixCommand(host, { function: "SetText", input, selectedName: field, value }),
  overlayIn: (host: string, input: string, channel = 1) =>
    sendVmixCommand(host, { function: `OverlayInput${channel}In`, input }),
  overlayOut: (host: string, channel = 1) =>
    sendVmixCommand(host, { function: `OverlayInput${channel}Out` }),
};
