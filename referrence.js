//shape2
shape2.observe<MouseEvent>('mousedown')
.map(({clientX, clientY}) => ({
xOffset: Number(shape2.attr('x')) - clientX,
yOffset: Number(shape2.attr('y')) - clientY,
line
}))
.flatMap(({xOffset, yOffset,line}) =>
mousemove
    .takeUntil(mouseup)
    .map(({clientX, clientY}) => ({
    x: clientX + xOffset,
    y: clientY + yOffset,
    line
    })))
.subscribe(({x, y,line}) =>{
    line.attr('x2', x)
    .attr('y2', y);
    });

//shape
shape.observe<MouseEvent>('mousedown')
.map(({clientX, clientY}) => ({
xOffset: Number(shape.attr('x')) - clientX,
yOffset: Number(shape.attr('y')) - clientY,
line
}))
.flatMap(({xOffset, yOffset,line}) =>
mousemove
    .takeUntil(mouseup)
    .map(({clientX, clientY}) => ({
    x: clientX + xOffset,
    y: clientY + yOffset,
    line
    })))
.subscribe(({x, y,line}) =>{
    line.attr('x1', x)
    .attr('y1', y);
    });


/////////
let ShapeList:Elem[]=[];

function inRectangle(x:number, y:number) {
    for (var i = 0, l = ShapeList.length; i < l; i++) {
        if ((x - Number(ShapeList[i].attr('x'))) <= Number(ShapeList[i].attr('x'))+Number(ShapeList[i].attr('width')) 
            && (y - Number(ShapeList[i].attr('y'))) <= Number(ShapeList[i].attr('y'))+Number(ShapeList[i].attr('height')) 
            && (x - Number(ShapeList[i].attr('x'))) >= 0 && (y - Number(ShapeList[i].attr('y')))) {
            return ShapeList[i];    
        } 
    }
}

function dragShapeObservable(shapelabel:String) {
    const svg=document.getElementById('diagrameditor')
    const {left, top} = svg.getBoundingClientRect()
    const mouse1click = Observable.fromEvent<MouseEvent>(svg, "click")
    const mouseclick = Observable.fromEvent<MouseEvent>(svg, "dblclick")
    const mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove')
    const mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup')
    const mousedown = Observable.fromEvent<MouseEvent>(svg, 'mousedown')
    const mouseout = Observable.fromEvent<MouseEvent>(svg, 'mouseout')

  const shape=CreateShape(shapelabel)
  ShapeList.push(shape)
  if(shapelabel=='rect'||shapelabel=='square'){
    shape.observe<MouseEvent>('mousedown')
        .map(({clientX, clientY}) => ({
        xOffset: Number(shape.attr('x')) - clientX,
        yOffset: Number(shape.attr('y')) - clientY
        }))
        .flatMap(({xOffset, yOffset}) =>
        mousemove
            .takeUntil(mouseup)
            .map(({clientX, clientY}) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
            })))
        .subscribe(({x, y}) =>{
            shape.attr('x', x).attr('y', y)
            //myOption('s',shape)
            //dragShapeObservable(shapelabel)
            });

    shape.observe<MouseEvent>("dblclick")
    .map(e=>{e.stopPropagation();return e;})
    .map(e=>({event:e, svgBounds: svg.getBoundingClientRect()}))
    .map(({event, svgBounds})=> ({
        line:new Elem(svg,'line')
                .attr('x1',shape.attr('x'))
                .attr('y1',shape.attr('y'))
                .attr('x2',shape.attr('x'))
                .attr('y2',shape.attr('y'))
                .attr('stroke','purple')
                .attr('stroke-width','2'),
        svgBounds: svgBounds}))
    .flatMap(({line,svgBounds}) =>
    mousemove
        .takeUntil(mouseclick)
        .map(({clientX, clientY}) => ({
        x2: clientX-svgBounds.left,
        y2: clientY-svgBounds.top,
        line
        })))
        .subscribe(({x2, y2,line}) =>{
            line.attr('x2', x2)
            .attr('y2', y2);

            shape.observe<MouseEvent>('mousedown')
            .map(e=>{e.stopImmediatePropagation();return e;})
            .map(({clientX, clientY}) => ({
            xOffset: Number(shape.attr('x')) - clientX,
            yOffset: Number(shape.attr('y')) - clientY,
            line
            }))
            .flatMap(({xOffset, yOffset,line}) =>
            mousemove
                .takeUntil(mouseup)
                .map(({clientX, clientY}) => ({
                x: clientX + xOffset,
                y: clientY + yOffset,
                line
                })))
            .subscribe(({x, y,line}) =>{
                line.attr('x1', x)
                .attr('y1', y);
                });

            mousedown
            .takeUntil(mouseclick).subscribe(()=>{
            let shape2=inRectangle(x2,y2)
            shape2.observe<MouseEvent>('mousedown')
            .map(e=>{e.stopPropagation();return e;})
            .map(({clientX, clientY}) => ({
            xOffset: Number(shape2.attr('x')) - clientX,
            yOffset: Number(shape2.attr('y')) - clientY,
            line
            }))
            .flatMap(({xOffset, yOffset,line}) =>
            mousemove
                .takeUntil(mouseup)
                .map(({clientX, clientY}) => ({
                x: clientX + xOffset,
                y: clientY + yOffset,
                line
                })))
            .subscribe(({x, y,line}) =>{
                line.attr('x2', x)
                .attr('y2', y)
                }); 
            })

        })
    }
    else{
        shape.observe<MouseEvent>('mousedown')
        .map(({clientX, clientY}) => ({
        xOffset: Number(shape.attr('cx')) - clientX,
        yOffset: Number(shape.attr('cy')) - clientY
        }))
        .flatMap(({xOffset, yOffset}) =>
        mousemove
            .takeUntil(mouseup)
            .map(({clientX, clientY}) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
            })))
        .subscribe(({x, y}) =>{
            shape.attr('cx', x)
            .attr('cy', y);
            dragShapeObservable(shapelabel)
            }); 
    }

}

function CreateShape(shapelabel:String){
    const svg=document.getElementById('diagrameditor');
    if(shapelabel=='rect'){
        const rect = new Elem(svg, 'rect')
        .attr('x', 30).attr('y', 50)
        .attr('width', 120).attr('height', 80)
        .attr('fill', 'red').attr('cursor','move')
        .attr('value','true').attr('id','shape')
        return rect
    }
    else if(shapelabel=='circle'){
        const circle = new Elem(svg, 'circle')
        .attr('cx', 90).attr('cy', 320)
        .attr('r',50)
        .attr('fill', 'blue').attr('cursor','move')
        .attr('id','shape')
        return circle
    }
    else if(shapelabel=='square'){
        const square = new Elem(svg, 'rect')
        .attr('x', 40).attr('y', 150)
        .attr('rx',30).attr('ry',30)
        .attr('width', 100).attr('height', 100)
        .attr('fill', 'green').attr('cursor','move')
        .attr('id','shape')
        return square
    }
    else if(shapelabel=='ellipse'){
        const ellipse = new Elem(svg, 'ellipse')
        .attr('cx', 90).attr('cy', 440)
        .attr('rx',70).attr('ry',50).attr('r',50)
        .attr('fill', 'orange').attr('cursor','move')
        .attr('id','shape')
        return ellipse
    }
}

function myOption(choice:String,shape:Elem){
    const svg2=document.getElementById('option')
    const svg=document.getElementById('diagrameditor')
    const mouseclick = Observable.fromEvent<MouseEvent>(svg, "dblclick")
    const mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove')
    const mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup')
    const mouseout = Observable.fromEvent<MouseEvent>(svg, 'mouseout')
    const line=new Elem(svg2,'line')
            .attr('x1',10).attr('y1',10)
            .attr('x2',110).attr('y2',110)
            .attr('stroke','purple').attr('stroke-width',4)
            .attr('id','option1').attr('cursor','pointer')
    line.observe('mousedown').subscribe(()=>{
    Observable.fromEvent<MouseEvent>(svg,'mousemove')
    .map(e=>({event:e, svgBounds: svg.getBoundingClientRect()}))
    .map(({event, svgBounds})=> ({
        line:new Elem(svg,'line')
                .attr('x1',shape.attr('x'))
                .attr('y1',shape.attr('y'))
                .attr('x2',shape.attr('x'))
                .attr('y2',shape.attr('y'))
                .attr('stroke','purple')
                .attr('stroke-width','2'),
        svgBounds: svgBounds}))
    .flatMap(({line,svgBounds}) =>
        mousemove
        .takeUntil(mouseclick)
        .map(({clientX, clientY}) => ({
            x1: Number(shape.attr('x')),
            y1: Number(shape.attr('y')),
            x2: clientX-svgBounds.left,
            y2: clientY-svgBounds.top,
            line})))
    .takeUntil(mouseclick)
        .subscribe(({x1,y1,x2, y2,line}) =>{
            line.attr('x1',x1)
            .attr('y1',y1)
            .attr('x2', x2)
            .attr('y2', y2)
            
            shape.observe<MouseEvent>('mousedown')
            .map(({clientX, clientY}) => ({
            xOffset: Number(shape.attr('x')) - clientX,
            yOffset: Number(shape.attr('y')) - clientY,
            line
            }))
            .flatMap(({xOffset, yOffset,line}) =>
            mousemove
                .takeUntil(mouseup)
                .map(({clientX, clientY}) => ({
                x: clientX + xOffset,
                y: clientY + yOffset,
                line
                })))
            .subscribe(({x, y,line}) =>{
                line.attr('x1', x)
                .attr('y1', y);
                });
        })
    })
}

function palette(){
    const svg=document.getElementById('diagrameditor')
    const mouse1click = Observable.fromEvent<MouseEvent>(svg, "click")
    const mouseclick = Observable.fromEvent<MouseEvent>(svg, "dblclick")
    const mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove')
    const mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup')
    const mousedown = Observable.fromEvent<MouseEvent>(svg, 'mousedown')
    const mouseout = Observable.fromEvent<MouseEvent>(svg, 'mouseout')
    const rect = new Elem(svg, 'rect')
    .attr('x', 30).attr('y', 50)
    .attr('width', 120).attr('height', 80)
    .attr('fill', 'red').attr('cursor','move')
    .attr('value','true').attr('id','shape')
    const square = new Elem(svg, 'rect')
    .attr('x', 40).attr('y', 150)
    .attr('rx',30).attr('ry',30)
    .attr('width', 100).attr('height', 100)
    .attr('fill', 'green').attr('cursor','move')
    .attr('id','shape')
    const circle = new Elem(svg, 'circle')
    .attr('cx', 90).attr('cy', 320)
    .attr('r',50)
    .attr('fill', 'blue').attr('cursor','move')
    .attr('id','shape')
    const ellipse = new Elem(svg, 'ellipse')
    .attr('cx', 90).attr('cy', 440)
    .attr('rx',70).attr('ry',50).attr('r',50)
    .attr('fill', 'orange').attr('cursor','move')
    .attr('id','shape')
    const clickAndGive=Observable.fromEvent<MouseEvent>(svg,'mousedown')
    .flatMap(()=>mousemove.takeUntil(mouseup).map(()=>{dragShapeObservable('rect')}))
}

function createRect(){
    const svg=document.getElementById('diagrameditor')
    const mouse1click = Observable.fromEvent<MouseEvent>(svg, "click")
    const mouseclick = Observable.fromEvent<MouseEvent>(svg, "dblclick")
    const mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove')
    const mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup')
    const mousedown = Observable.fromEvent<MouseEvent>(svg, 'mousedown')
    const mouseout = Observable.fromEvent<MouseEvent>(svg, 'mouseout')
    const rect = new Elem(svg, 'rect')
    .attr('x', 30).attr('y', 50)
    .attr('width', 120).attr('height', 80)
    .attr('fill', 'red').attr('cursor','move')
    .attr('value','true').attr('id','shape')
    const clickAndGive=rect.observe<MouseEvent>('mousedown')
    .flatMap(()=>mousemove.takeUntil(mouseup).map(()=>{dragShapeObservable('rect')}))
}

if (typeof window != 'undefined')
window.onload = ()=>{
    palette()
    //dragShapeObservable('rect')
    //dragShapeObservable('square')
    //dragShapeObservable('circle')
    //dragShapeObservable('ellipse')
}
//////////~~~~~~~~~~
function buttonHoveredObservable(shape:Elem,shapelabel:string){
    const svg=document.getElementById('diagrameditor')
    const button=document.getElementById("link")
    Observable.fromEvent<MouseEvent>(button,'mouseover')
    .subscribe(()=>{
        button.setAttribute('width','55')
        button.setAttribute('height','55')
        button.setAttribute('x',String(Number(shape.attr('x'))-Number(button.getAttribute('width'))/4))
        button.setAttribute('y',String(Number(shape.attr('y'))-Number(button.getAttribute('height'))/4))
    })
    Observable.fromEvent<MouseEvent>(button,'mouseout')
    .subscribe(()=>{
        button.setAttribute('width','0')
        button.setAttribute('height','0')
        button.setAttribute('opacity','1')
    })
}

function showButtonObservable(shape:Elem,shapelabel:string){
    const svg=document.getElementById('diagrameditor')
    const button=document.getElementById('link')
    shape.observe<MouseEvent>('mouseover')
    .filter(()=>Number(shape.attr('x'))>=200)
        .subscribe(()=>{
            button.setAttribute('width','50')
            button.setAttribute('height','50')
            button.setAttribute('x',String(Number(shape.attr('x'))-Number(button.getAttribute('width'))/4))
            button.setAttribute('y',String(Number(shape.attr('y'))-Number(button.getAttribute('height'))/4))
            buttonHoveredObservable(shape,shapelabel)
            buttonClicked(shape,shapelabel)
        })
    shape.observe<MouseEvent>("click")
    .filter(()=>Number(shape.attr('x'))>=200)
        .subscribe(()=>{
            button.setAttribute('width','50')
            button.setAttribute('height','50')
            button.setAttribute('x',String(Number(shape.attr('x'))-Number(button.getAttribute('width'))/4))
            button.setAttribute('y',String(Number(shape.attr('y'))-Number(button.getAttribute('height'))/4))
        })
}

function hideButtonObservable(shape:Elem,shapelabel:string){
    const svg=document.getElementById('diagrameditor')
    const button=document.getElementById("link")
    shape.observe<MouseEvent>('mouseout')
    .subscribe(()=>{
        button.setAttribute('width','0')
        button.setAttribute('height','0')
    })
    shape.observe<MouseEvent>('mousedown')
    .subscribe(()=>{
        button.setAttribute('width','0')
        button.setAttribute('height','0')
    })
}

function buttonClicked(shape:Elem,shapelabel:string){
    const svg=document.getElementById('diagrameditor')
    const mouseclick = Observable.fromEvent<MouseEvent>(svg, "click")
    const mousedblclick = Observable.fromEvent<MouseEvent>(svg, "dblclick")
    const mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove')
    const mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup')
    const mousedown = Observable.fromEvent<MouseEvent>(svg, 'mousedown')
    const button=document.getElementById('link')
    shape.observe<MouseEvent>('mouseover')
    .takeUntil(shape.observe<MouseEvent>('mouseout'))
    .subscribe(()=>{
    Observable.fromEvent<MouseEvent>(button,'mousedown')
    .takeUntil(Observable.fromEvent<MouseEvent>(button,"click"))
    .map(e=>{e.stopImmediatePropagation();return e;})
    .map(e=>({event:e, svgBounds: svg.getBoundingClientRect()}))
    .map(({event, svgBounds})=> ({
        line:new Elem(svg,'line')
                .attr('x1',shape.attr('x'))
                .attr('y1',shape.attr('y'))
                .attr('x2',shape.attr('x'))
                .attr('y2',shape.attr('y'))
                .attr('stroke','purple')
                .attr('stroke-width','2'),
        svgBounds: svgBounds}))
    .flatMap(({line,svgBounds}) =>
    mousemove
        .takeUntil(mousedblclick)
        .map(({clientX, clientY}) => ({
        x2: clientX-svgBounds.left,
        y2: clientY-svgBounds.top,
        line
        })))
        .subscribe(({x2, y2,line}) =>{

            line.attr('x2', x2)
            .attr('y2', y2)

            shape.observe<MouseEvent>('mousedown')
            .map(({clientX, clientY}) => ({
            xOffset: Number(shape.attr('x')) - clientX,
            yOffset: Number(shape.attr('y')) - clientY,
            line
            }))
            .flatMap(({xOffset, yOffset,line}) =>
            mousemove
                .takeUntil(mouseup)
                .map(({clientX, clientY}) => ({
                x: clientX + xOffset,
                y: clientY + yOffset,
                line
                })))
            .subscribe(({x, y,line}) =>{
                line.attr('x1', x)
                .attr('y1', y);
                });

            mousedown
            .takeUntil(mouseclick).subscribe(()=>{
            let shape2=inRectangle(x2,y2)
            shape2.observe<MouseEvent>('mousedown')
            .map(({clientX, clientY}) => ({
            xOffset: Number(shape2.attr('x')) - clientX,
            yOffset: Number(shape2.attr('y')) - clientY,
            line
            }))
            .flatMap(({xOffset, yOffset,line}) =>
            mousemove
                .takeUntil(mouseup)
                .map(({clientX, clientY}) => ({
                x: clientX + xOffset,
                y: clientY + yOffset,
                line
                })))
            .subscribe(({x, y,line}) =>{
                line.attr('x2', x)
                .attr('y2', y)
                }); 
            })
        })
    })
    
    Observable.fromEvent<MouseEvent>(button,'mousedown')
    .subscribe(()=>{
        button.setAttribute('width','45')
        button.setAttribute('height','45')
    })
    
    Observable.fromEvent<MouseEvent>(button,"click")
    .subscribe(()=>{
        button.setAttribute('width','50')
        button.setAttribute('height','50')
    })    
}

//
shape.observe('mousedown')
.map(e=>({event:e,svgBounds: svg.getBoundingClientRect()}))
.subscribe(({event,svgBounds})=>{
  const topLeftX = Number(shape.attr('x'))
  const topLeftY = Number(shape.attr('y'))
  const topRightX = topLeftX+Number(shape.attr('width'))
  const topRightY = topLeftY
  const bottomLeftX = topLeftX
  const bottomLeftY = topLeftY+Number(shape.attr('height'))
  const bottomRightX = topRightX
  const bottomRightY = bottomLeftY
  const centerX = topLeftX+Number(shape.attr('width'))/2
  const centerY = topLeftY+Number(shape.attr('height'))/2

    mousemove
    .takeUntil(mouseup)
    .map(({clientX, clientY})=>({
      topLeftX,topLeftY,topRightX,topRightY,
      bottomLeftX,bottomLeftY,bottomRightX,bottomRightY,
      centerX,centerY,
      x: clientX - svgBounds.left, 
      y: clientY - svgBounds.top}))
    .subscribe(({topLeftX,topLeftY,topRightX,topRightY,
                bottomLeftX,bottomLeftY,bottomRightX,bottomRightY,
                centerX,centerY,x,y})=>{
      if(x>=topLeftX&&y>=topLeftY){
        shape.attr('x', Math.min(x,topLeftX))
            .attr('y', Math.min(x,topLeftY))
            .attr('width', Math.abs(topLeftX - x))
            .attr('height', Math.abs(topLeftY - y))
      }
      else if(x>=bottomLeftX&&y<bottomLeftY){
        shape.attr('x', Math.min(x,topLeftX))
            .attr('y', y)
            .attr('width', Math.abs(topLeftX - x))
            .attr('height', Math.abs(bottomLeftY-y))
      }
      else if(x<centerX&&y<centerY){
        shape.attr('x', x)
            .attr('y', y)
            .attr('width', Math.abs(bottomLeftX-x))
            .attr('height', Math.abs(bottomLeftY-y))
      }
      else{
        shape.attr('x', x)
            .attr('y', Math.min(y,topLeftY))
            .attr('width', Math.abs(bottomLeftX - x))
            .attr('height', Math.abs(topLeftY-y))
      }
    })
})