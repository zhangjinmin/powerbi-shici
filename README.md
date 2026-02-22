# powerbi-shici
一个小练习，用了一言的api做的一个powerbi视觉对象

主要几个文件如下：

capabilities.json

```json
{
  "dataRoles": [],
  "dataViewMappings": [
    {
      "table": {
        "rows": {
          "select": []
        }
      }
    }
  ],
  "objects": {
    "styleSettings": {
      "displayName": "文字样式",
      "properties": {
        "textColor": {
          "displayName": "字体颜色",
          "type": {
            "fill": {
              "solid": {
                "color": true
              }
            }
          }
        },
        "fontFamily": {
          "displayName": "字体系列",
          "type": {
            "formatting": {
              "fontFamily": true
            }
          }
        },
        "textOpacity": {
          "displayName": "透明度 (%)",
          "type": {
            "numeric": true
          }
        },
        "textAlign": {
          "displayName": "对齐方式",
          "type": {
            "enumeration": [
              { "displayName": "左对齐", "value": "left" },
              { "displayName": "居中", "value": "center" },
              { "displayName": "右对齐", "value": "right" }
            ]
          }
        },
        "bold": {
          "displayName": "加粗",
          "type": { "bool": true }
        },
        "italic": {
          "displayName": "斜体",
          "type": { "bool": true }
        },
        "underline": {
          "displayName": "下划线",
          "type": { "bool": true }
        },
        "showShadow": {
          "displayName": "启用阴影",
          "type": { "bool": true }
        },
        "shadowColor": {
          "displayName": "阴影颜色",
          "type": {
            "fill": {
              "solid": {
                "color": true
              }
            }
          }
        },
        "resizeMode": {
          "displayName": "大小控制模式",
          "type": {
            "enumeration": [
              { "displayName": "自动适应 (Auto)", "value": "auto" },
              { "displayName": "固定数值 (Manual)", "value": "manual" }
            ]
          }
        },
        "fontSize": {
          "displayName": "字体大小 (仅手动)",
          "type": { "numeric": true }
        }
      }
    }
  },
  "privileges": [],
  "supportsLandingPage": true,
  "supportsEmptyDataView": true
}
```



src/visual.ts

```typescript
"use strict";

import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import DataView = powerbi.DataView;

export class Visual implements IVisual {
    private target: HTMLElement;
    private textContainer: HTMLDivElement;
    
    // 默认设置
    private settings = {
        color: "#333333", 
        fontFamily: "Microsoft YaHei",
        opacity: 100,
        textAlign: "center", 
        bold: false,
        italic: false,
        underline: false,
        showShadow: false,
        shadowColor: "#000000",
        resizeMode: "auto", 
        fontSize: 24
    };

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.textContainer = document.createElement("div");
        this.textContainer.classList.add("poem-text");
        this.textContainer.innerText = "加载中...";
        this.target.appendChild(this.textContainer);
        this.fetchPoem();
    }

    private async fetchPoem() {
        try {
            const url = "https://v1.jinrishici.com/all.txt?v=" + Math.random();
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network error");
            const text = await response.text();
            this.textContainer.innerText = text;
        } catch (error) {
            this.textContainer.innerText = "加载失败";
        }
    }

    public update(options: VisualUpdateOptions) {
        if (options.dataViews && options.dataViews[0]) {
            this.parseSettings(options.dataViews[0]);
        }

        // 1. 计算字体大小
        let finalFontSize = this.settings.fontSize;
        if (this.settings.resizeMode === "auto") {
            const width = options.viewport.width;
            const height = options.viewport.height;
            finalFontSize = Math.min(width, height) / 10;
            if (finalFontSize < 12) finalFontSize = 12;
        }

        const style = this.textContainer.style;

        // 2. 应用基础样式
        style.color = this.settings.color;
        style.fontFamily = this.settings.fontFamily;
        style.opacity = (this.settings.opacity / 100).toString();
        style.fontSize = finalFontSize + "px";

        // 3. 应用对齐方式 (同时处理 Flex 布局和文本对齐)
        style.textAlign = this.settings.textAlign;
        if (this.settings.textAlign === "left") {
            style.justifyContent = "flex-start";
        } else if (this.settings.textAlign === "right") {
            style.justifyContent = "flex-end";
        } else {
            style.justifyContent = "center";
        }

        // 4. 应用文字样式 (加粗/斜体/下划线)
        style.fontWeight = this.settings.bold ? "bold" : "normal";
        style.fontStyle = this.settings.italic ? "italic" : "normal";
        style.textDecoration = this.settings.underline ? "underline" : "none";

        // 5. 应用阴影 (2px 2px 4px 是一个比较舒服的参数)
        if (this.settings.showShadow) {
            style.textShadow = `2px 2px 4px ${this.settings.shadowColor}`;
        } else {
            style.textShadow = "none";
        }
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        const objectName = options.objectName;
        const objectEnumeration: VisualObjectInstance[] = [];

        if (objectName === 'styleSettings') {
            objectEnumeration.push({
                objectName: objectName,
                properties: {
                    textColor: this.settings.color,
                    fontFamily: this.settings.fontFamily,
                    textOpacity: this.settings.opacity,
                    
                    // 新增的属性
                    textAlign: this.settings.textAlign,
                    bold: this.settings.bold,
                    italic: this.settings.italic,
                    underline: this.settings.underline,
                    showShadow: this.settings.showShadow,
                    shadowColor: this.settings.shadowColor,

                    resizeMode: this.settings.resizeMode,
                    fontSize: this.settings.fontSize
                },
                selector: null
            });
        }

        return objectEnumeration;
    }

    private parseSettings(dataView: DataView) {
        const objectName = "styleSettings";
        const metadata = dataView.metadata;

        if (metadata && metadata.objects && metadata.objects[objectName]) {
            const object = metadata.objects[objectName];

            // 提取颜色
            if (object["textColor"]) {
                const fill = object["textColor"] as any;
                if (fill.solid && fill.solid.color) this.settings.color = fill.solid.color;
            }
            // 提取阴影颜色
            if (object["shadowColor"]) {
                const fill = object["shadowColor"] as any;
                if (fill.solid && fill.solid.color) this.settings.shadowColor = fill.solid.color;
            }

            if (object["fontFamily"]) this.settings.fontFamily = object["fontFamily"] as string;
            if (object["textOpacity"] !== undefined) this.settings.opacity = object["textOpacity"] as number;
            
            if (object["textAlign"]) this.settings.textAlign = object["textAlign"] as string;
            if (object["bold"] !== undefined) this.settings.bold = object["bold"] as boolean;
            if (object["italic"] !== undefined) this.settings.italic = object["italic"] as boolean;
            if (object["underline"] !== undefined) this.settings.underline = object["underline"] as boolean;
            if (object["showShadow"] !== undefined) this.settings.showShadow = object["showShadow"] as boolean;

            if (object["resizeMode"]) this.settings.resizeMode = object["resizeMode"] as string;
            if (object["fontSize"]) this.settings.fontSize = object["fontSize"] as number;
        }
    }
}
```



style/visual.less

```less
.visual-host {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.poem-text {
    // Flex 布局：核心作用是垂直居中
    display: flex;
    // 水平方向由 JS 控制 (flex-start/center/flex-end)
    align-items: center;     
    
    width: 100%;
    height: 100%;
    
    padding: 20px;
    box-sizing: border-box;
    
    // 文本换行处理
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.5;
    
    // 过渡动画：让样式变化时更丝滑
    transition: all 0.2s ease-in-out;
}
```

