export class RequestQueue {
    constructor(limit) {
      this.queue = [];
      this.limit = limit;
      this.activeCount = 0;
    }
  
    enqueue(requestFn) {
      this.queue.push(requestFn);
      this.runNext();
    }
  
    runNext() {
      if (this.activeCount < this.limit && this.queue.length > 0) {
        const requestFn = this.queue.shift();
        this.activeCount++;
        requestFn().finally(() => {
          this.activeCount--;
          this.runNext();
        });
      }
    }
  }