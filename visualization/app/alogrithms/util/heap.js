// 大顶堆
class MaxHeap {
    constructor(comparator) {
      // 首位元素空出来，好乘计算
      this.heap = [];
      if (this.comparator) this.lager = comparator
    }

    get size () {
      return this.heap.length
    }
  
    // 添加元素到堆中
    insert(element) {
      this.heap.push(element);
      this.heapifyUp(this.size - 1);
    }
  
    // 删除堆中的最大元素
    extractMax() {
      if (this.size === 0) {
        return null;
      }
  
      if (this.size === 1) {
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
      if (this.lager(this.heap[index], this.heap[parentIndex])) {
        this.swap(parentIndex, index);
        this.heapifyUp(parentIndex);
      }
    }

    lager(a, b) {
      return a > b
    }

    inBound(idx) {
      return idx < this.size
    }
  
    // 将元素下移
    heapifyDown(index) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let largest = index;
  
      if (this.inBound(leftChildIndex) && this.lager(this.heap[leftChildIndex], this.heap[largest])) {
        largest = leftChildIndex;
      }
  
      if (this.inBound(rightChildIndex) && this.lager(this.heap[rightChildIndex], this.heap[largest])) {
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

export default MaxHeap
