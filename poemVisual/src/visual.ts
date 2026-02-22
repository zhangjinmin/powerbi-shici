"use strict";

import powerbi from "powerbi-visuals-api";
// 1. 确保这一行必须存在！否则样式文件不会被加载
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

export class Visual implements IVisual {
    private target: HTMLElement;
    private img: HTMLImageElement;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        
        this.img = document.createElement("img");
        this.img.src = "https://v1.jinrishici.com/all.svg";
        
        // 2. 关键修改：给图片加一个固定的类名，方便在 LESS 里控制
        this.img.classList.add("auto-resize");

        this.target.appendChild(this.img);
    }

    public update(options: VisualUpdateOptions) {
        // CSS 会自动处理大小，这里不需要写逻辑
    }
}