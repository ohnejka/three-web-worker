import { Component, AfterViewInit, Input, HostListener } from '@angular/core';
import { IMessage, ISize } from '../IMessage';
import { Handlers } from '../Handlers';


let worker;

if (typeof Worker !== 'undefined') {
  worker = new Worker('../canvas.worker', { type: 'module' });
  worker.onmessage = ({ data }) => {
    console.log(`page got message: ${data}`);
  };
  // worker.postMessage('hello');
} else {
  // Web Workers are not supported in this environment.
  // You should add a fallback so that your program still executes correctly.
}


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements AfterViewInit {

  private worker = worker;
  @Input() canvasEl: HTMLCanvasElement;

  ngAfterViewInit(): void {

    const offscreen = this.canvasEl.transferControlToOffscreen();
    const canvasMessage: IMessage = {
      type: Handlers.Main,
      data: offscreen
    }
    this.worker.postMessage(canvasMessage, [offscreen]);

    this.updateSize()
  }

  @HostListener('window: resize')
  onResize(): void {
    this.updateSize()
  }

  private updateSize(): void {
    const canvasSize: ISize = {
      type: Handlers.Size,
      width: this.canvasEl.clientWidth,
      height: this.canvasEl.clientHeight
    }

    this.worker.postMessage(canvasSize);
  }

}
