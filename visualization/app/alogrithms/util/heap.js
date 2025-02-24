// 大顶堆
class MaxHeap {
    constructor() {
      this.heap = [];
    }
  
    // 添加元素到堆中
    insert(element) {
      this.heap.push(element);
      this.heapifyUp(this.heap.length - 1);
    }
  
    // 删除堆中的最大元素
    extractMax() {
      if (this.heap.length === 0) {
        return null;
      }
  
      if (this.heap.length === 1) {
        return this.heap.pop();
      }
  
      const max = this.heap[0];
      this.heap[0] = this.heap.pop();
      this.heapifyDown(0);
  
      return max;
    }
  
    // 将元素上移
    heapifyUp(index) {
      if (index === 0) {
        return;
      }
  
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex] < this.heap[index]) {
        this.swap(parentIndex, index);
        this.heapifyUp(parentIndex);
      }
    }
  
    // 将元素下移
    heapifyDown(index) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let largest = index;
  
      if (leftChildIndex < this.heap.length && this.heap[leftChildIndex] > this.heap[largest]) {
        largest = leftChildIndex;
      }
  
      if (rightChildIndex < this.heap.length && this.heap[rightChildIndex] > this.heap[largest]) {
        largest = rightChildIndex;
      }
  
      if (largest !== index) {
        this.swap(largest, index);
        this.heapifyDown(largest);
      }
    }
  
    // 交换两个元素
    swap(i, j) {
      const temp = this.heap[i];
      this.heap[i] = this.heap[j];
      this.heap[j] = temp;
    }
  }
