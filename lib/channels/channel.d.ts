export as namespace channels;

declare const UI_CHANNEL: string;
declare const SSH_CHANNEL: string;
declare const SCP_CHANNEL: string;
declare const REFER_ANALYSIS: string;
declare const REFER_ANALYSIS_GRAPH: string;
declare const DIALOG: string;

enum DialogType {
    DirectoryDialog = 0,
    FileDialog = 1
};

export {
    UI_CHANNEL,
    SSH_CHANNEL,
    SCP_CHANNEL,
    REFER_ANALYSIS,
    REFER_ANALYSIS_GRAPH,
    DIALOG,

    DialogType
}