export const isMac = /(Mac|iPhone|iPod|iPad)/i.test(self.navigator.platform);
export const isIOS = /(iPhone|iPod|iPad)/i.test(self.navigator.platform);
export const isWindow = typeof Window !== 'undefined' && self instanceof Window;
export const isSharedWorker =
    typeof SharedWorkerGlobalScope !== 'undefined' && self instanceof SharedWorkerGlobalScope;
export const isWorker =
    !isSharedWorker &&
    typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope;
