//Student:Ho Kong Zheng
//ID:28279174

let resizeAndCancelList:Elem[][]=[] //a list to store the resize frame when resize is clicked and pop when cancellation or dragging occurs
let resizeAndCancelHandler=true //boolean to determine whether resize is in use
let linkList:Element[][]=[] //a list to store pair of shapes which is connected by a line/connector
let linkHandler=true //boolean to determine whether user is drawing line
let currentShapeNum:number //variable to determine which shape is served according to its number

function linkChecker(shape:Elem){
    //function to check whether shape is not linked by a connector by going through linkList 
    for(let i=0,l=linkList.length;i<l;i++){
        //shape could be 1st or 2nd item or neither
        if(linkList[i][0]==shape.elem||linkList[i][1]==shape.elem){
            return false
        }
    }
    //not found if loop is finished
    return true
}
function connectorFinder(shape:Elem){
    //function to check which connector is used to link the shape 
    const svg=document.getElementById('diagrameditor')
    const connectorList=[]//shape could have zero, one or more than one connectors
    for (let i = 0, l = svg.childElementCount; i < l; i++){
        let centerRSX=Number(shape.attr('x'))+Number(shape.attr('width'))/2 //center x coordinate of Rectangle/Square
        let centerRSY=Number(shape.attr('y'))+Number(shape.attr('height'))/2 //center y coordinate of Rectangle/Square 
        let centerCEX=Number(shape.attr('cx')) //center x coordinate of Circle/Ellipse 
        let centerCEY=Number(shape.attr('cy')) //center y coordinate of Circle/Ellipse 
        let lineStartX=Number(svg.children[i].getAttribute('x1')) //x coordinate of the start of line
        let lineStartY=Number(svg.children[i].getAttribute('y1')) //y coordinate of the start of line
        let lineEndX=Number(svg.children[i].getAttribute('x2')) //x coordinate of the end of line
        let lineEndY=Number(svg.children[i].getAttribute('y2')) //y coordinate of the end of line
        let lineID=svg.children[i].getAttribute('id') //id of line

        //undefined and id here are to differentiate which shape is valid 
        if(((centerRSX!=undefined&&centerRSY!=undefined)||(centerCEX!=undefined&&centerCEY!=undefined))&&(lineID=='link')){
            if (((lineEndX==centerRSX&&lineEndY==centerRSY)||(lineEndX==centerCEX&&lineEndY==centerCEY)
                ||(lineStartX==centerRSX&&lineStartY==centerRSY)||(lineStartX==centerCEX&&lineStartY==centerCEY))){
                    connectorList.push(svg.children[i])
            }
        }
    }
    return connectorList
}

function insideRectAndSquareChecker(shape:Elem,x:number, y:number) {
    //function to check whether the point is fallen within a rectangle or square
    const svg=document.getElementById('diagrameditor')
    for (let l = 0, i = svg.childElementCount; i-1 >= l; i--) {
        //undefined here could be deleted svg element
        if(svg.children[i]!=undefined){
            let ShapeID=svg.children[i].getAttribute('id') //id of shape

            //only rectangle and square are accepted
            if(ShapeID=='rect'||ShapeID=='square'){
                let ShapeX=Number(svg.children[i].getAttribute('x')) //x coordinate of shape (top left corner)
                let ShapeY=Number(svg.children[i].getAttribute('y')) //y coordinate of shape (top left corner)
                let ShapeWidth=Number(svg.children[i].getAttribute('width')) //width of shape
                let ShapeHeight=Number(svg.children[i].getAttribute('height')) //height of shape

                //the last statement is to avoid itself
                if ((x <=ShapeX+ShapeWidth)&& (y <= ShapeY+ShapeHeight)
                    && ((x-ShapeX) >= 0) && ((y - ShapeY)>=0)&&(ShapeX>=200)
                    && (Number(shape.attr('x'))!=ShapeX||Number(shape.attr('y'))!=ShapeY)) {
                    return svg.children[i]  
                }
            } 
        }
    }
}

function insideCircleChecker(shape:Elem,x:number, y:number) {
    //function to check whether the point is fallen within a circle
    const svg=document.getElementById('diagrameditor')
    for (let l = 0, i = svg.childElementCount; i-1 >= l; i--) {
        //undefined here could be deleted svg element
        if(svg.children[i]!=undefined){
            let ShapeID=svg.children[i].getAttribute('id') //id of shape

            //only circle is accepted
            if(ShapeID=='circle'){
                let ShapeX=Number(svg.children[i].getAttribute('cx')) //center x coordinate of shape
                let ShapeY=Number(svg.children[i].getAttribute('cy')) //center y coordinate of shape
                let ShapeRadius=Number(svg.children[i].getAttribute('r')) //radius of shape
                let distance=(Math.sqrt(Math.pow((x-ShapeX),2)+Math.pow((y-ShapeY),2))) 
                //distance formula between 2 points sqrt((x1-x2)^2+(y1-y2)^2)

                //if point to center is less than radius then it falls within the circle
                //connecting shape itself is avoided
                if(distance<=ShapeRadius&&ShapeX-ShapeRadius>=200&&(Number(shape.attr('cx'))!=ShapeX||Number(shape.attr('cy'))!=ShapeY)){
                    return svg.children[i]  
                } 
            }
        }
    }
}

function insideEllipseChecker(shape:Elem,x:number,y:number){
    //function to check whether the point is fallen within a ellipse
    const svg=document.getElementById('diagrameditor')
    for (let l = 0, i = svg.childElementCount; i-1 >= l; i--) {
        //undefined here could be deleted svg element
        if(svg.children[i]!=undefined){
            let ShapeID=svg.children[i].getAttribute('id') //id of shape

            //only ellipse is accepted
            if(ShapeID=='ellipse'){
                let ShapeX=Number(svg.children[i].getAttribute('cx')) //center x coordinate of shape
                let ShapeY=Number(svg.children[i].getAttribute('cy')) //center y coordinate of shape
                let ShapeRadiusX=Number(svg.children[i].getAttribute('rx')) //radius of shape in direction x
                let ShapeRadiusY=Number(svg.children[i].getAttribute('ry')) //radius of shape in direction y
                let distance=(Math.sqrt(Math.pow(((x-ShapeX)/ShapeRadiusX),2)+Math.pow(((y-ShapeY)/ShapeRadiusY),2))) 
                //distance formula to form an equation for ellipse using its attributes (x-h/rx)^2+(y-k/ry)^2=1 where h,k= origin of ellipse

                //recall mathematics theorem, by substituting point into formula we form above
                //connecting shape itself is avoided
                if(distance<=1&&ShapeX-ShapeRadiusX>=200&&(Number(shape.attr('cx'))!=ShapeX||Number(shape.attr('cy'))!=ShapeY)) {
                    return svg.children[i]  
                }
            } 
        }
    }
}

function clearOption(){
    //function to clear all menu buttons and text 
    const svg2=document.getElementById('option')

    //svg is like a node list 
    //if first item is not undefined, it means there exists an item and then remove it
    while (svg2.firstChild) {
        svg2.removeChild(svg2.firstChild)
    }
}

function showOptionObservable(shape:Elem,shapelabel:string,num:Elem){
    //function to set up an Observable for showing menu buttons for the shape passed
    const svg=document.getElementById('diagrameditor') //svg is the shape playground
    const svg2=document.getElementById('option') //svg2 is the menu bar

    //if mousedown is detected, delete all buttons 
    //as buttons for previous shape take extra space and they might cause bug 
    shape.observe<MouseEvent>('mousedown').subscribe(()=>{
        clearOption()
        lineButton(shape,shapelabel) //create line button
        deleteButton(shape,num) //create delete button
        resizeButton(shape,shapelabel,num) //create resize button

        //showing user which shape is being served
        const shapeNum=new Elem(svg2,'text').attr('x',750).attr('y',100)
        .attr('font-size',15).attr('font-weight','bold').attr('font-family','Monaco')
        shapeNum.elem.textContent='Serving:#'+num.elem.textContent
    })
}

function lineButton(shape:Elem,shapelabel:string){
    //function to create a line button
    const svg2=document.getElementById('option')
    const line=new Elem(svg2,'line')
    .attr('x1',10).attr('y1',10)
    .attr('x2',110).attr('y2',110)
    .attr('stroke','purple').attr('stroke-width',10).attr('cursor','pointer')

    //Observable is set for line to detect mousedown in order to allow user to draw a line  
    line.observe("mousedown")
    .subscribe(()=>{
        //To stop user from using line button when resize function is used
        if(resizeAndCancelHandler){
            line.attr('stroke-width',10)
            .attr('stroke','purple')
            .attr('stroke-dasharray',3)
            linkHandler=false //Turning it to false means user is drawing line
            lineStartObservable(shape,shapelabel) //To start drawing line
        }
    })

    //Observable for line button effects 
    line.observe('mouseover')
    .subscribe(()=>{
        if(resizeAndCancelHandler){
            line.attr('stroke-width',11)
            .attr('stroke','yellow')
        }
        else{
            //effect showing that button is not allowed to use
            line.attr('cursor','not-allowed')
        }
    })

    //Observable for recovering line button attributes 
    line.observe('mouseout')
    .subscribe(()=>{
        if(resizeAndCancelHandler){
            line.attr('stroke-width',10)
            .attr('stroke-dasharray',0)
            .attr('stroke','purple')
        }
        else{
            //recover cursor back to original attribute
            line.attr('cursor','pointer')
        }
    })
}

function lineStartObservable(shape:Elem,shapelabel:string){
    //function to set up observables for the shape served and allow user to start drawing line
    const svg=document.getElementById('diagrameditor')
    const mouseclick = Observable.fromEvent<MouseEvent>(svg, "click")
    const mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove')
    const mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup')
    const mousedown = Observable.fromEvent<MouseEvent>(svg, 'mousedown')
    
    //only rectangle and square are accepted
    if(shapelabel=='rect'||shapelabel=='square'){
        const line=new Elem(svg,'line')
        .attr('x1',Number(shape.attr('x'))+Number(shape.attr('width'))/2)
        .attr('y1',Number(shape.attr('y'))+Number(shape.attr('height'))/2)
        .attr('x2',Number(shape.attr('x'))+Number(shape.attr('width'))/2)
        .attr('y2',Number(shape.attr('y'))+Number(shape.attr('height'))/2)
        .attr('stroke','purple')
        .attr('stroke-width','2')
        .attr('marker-start','url(#connector)') //here's where the black dot is while drawing line
        .attr('marker-end','url(#connector)') //here's where the black dot is while drawing line
        .attr('id','link') 

        //Observable to change the coordinates of the start of line when shape is being dragged
        shape.observe<MouseEvent>('mousedown')
        .map(({clientX, clientY}) => ({
        xOffset: Number(shape.attr('x'))+Number(shape.attr('width'))/2 - clientX,
        yOffset: Number(shape.attr('y'))+Number(shape.attr('height'))/2 - clientY
        }))
        .flatMap(({xOffset, yOffset}) =>
            mousemove
            .takeUntil(mouseup)
            .map(({clientX, clientY}) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
            })))
        .subscribe(({x, y}) =>{
            line.attr('x1', x)
            .attr('y1', y)
        })

        //here's why line is following the mouse cursor when user moves back to shape playground 
        //because svg change the coordinates of the end of line when svg is detecting mousemove
        //when user click (no matter it is on a shape or nothing), line drawing is stopped
        mousemove
        .takeUntil(mouseclick)
        .map(e=>({event:e, svgBounds: svg.getBoundingClientRect()}))
        .map(({event,svgBounds}) => ({
            x2: event.clientX-svgBounds.left,
            y2: event.clientY-svgBounds.top}))
        .subscribe(({x2, y2}) =>{
            line.attr('x2', x2)
            .attr('y2', y2)
        })
        
        //here's the Observable to connect shape with another shape using line
        //mousedown and mouseclick here are to create an one-time event since click is mousedown followed by mouseup
        mousedown
        .takeUntil(mouseclick)
        .map(e=>({event:e, svgBounds: svg.getBoundingClientRect()}))
        .map(({event,svgBounds}) => ({
            x: event.clientX-svgBounds.left,
            y: event.clientY-svgBounds.top}))
        .subscribe(({x,y})=>{
            //if-statement here is to fix my bug when I click on nothing
            if(connectorFinder(shape).filter(link=>link==line.elem).length>0){
                lineEndObservable(shape,line,x,y) //to set up observable for another shape found
            }
        })
    }
    else{
        //same thing with the idea above but it is for circle and ellipse
        const line=new Elem(svg,'line')
        .attr('x1',shape.attr('cx'))
        .attr('y1',shape.attr('cy'))
        .attr('x2',shape.attr('cx'))
        .attr('y2',shape.attr('cy'))
        .attr('stroke','purple')
        .attr('stroke-width','2')
        .attr('marker-start','url(#connector)')
        .attr('marker-end','url(#connector)')
        .attr('id','link')

        shape.observe<MouseEvent>('mousedown')
        .map(({clientX, clientY}) => ({
        xOffset: Number(shape.attr('cx')) - clientX,
        yOffset: Number(shape.attr('cy')) - clientY,
        }))
        .flatMap(({xOffset, yOffset}) =>
            mousemove
            .takeUntil(mouseup)
            .map(({clientX, clientY}) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
            })))
        .subscribe(({x, y}) =>{
            line.attr('x1', x)
            .attr('y1', y);
            })

        mousemove
        .takeUntil(mouseclick)
        .map(e=>({event:e, svgBounds: svg.getBoundingClientRect()}))
        .map(({event,svgBounds}) => ({
            x2: event.clientX-svgBounds.left,
            y2: event.clientY-svgBounds.top}))
        .subscribe(({x2, y2}) =>{
            line.attr('x2', x2)
            .attr('y2', y2)
        })
        
        mousedown
        .takeUntil(mouseclick)
        .map(e=>({event:e, svgBounds: svg.getBoundingClientRect()}))
        .map(({event,svgBounds}) => ({
            x: event.clientX-svgBounds.left,
            y: event.clientY-svgBounds.top}))
        .subscribe(({x,y})=>{
            if(connectorFinder(shape).filter(link=>link==line.elem).length>0){
                lineEndObservable(shape,line,x,y)
            }
        })
    }
}

function lineEndObservable(shape:Elem,line:Elem,x:number,y:number){
    //function to find whether the end of line falls within a shape and set observable for it if found
    const svg=document.getElementById('diagrameditor')
    const mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove')
    const mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup')
        const shape2IsRectOrSquare=insideRectAndSquareChecker(shape,x,y) //undefined if not found, rectangle or square if found
        const shape2IsCircle=insideCircleChecker(shape,x,y) //undefined if not found, circle if found
        const shape2IsEllipse=insideEllipseChecker(shape,x,y) //undefined if not found, ellipse if found
        if(shape2IsRectOrSquare!=undefined){
            const shape2=shape2IsRectOrSquare
            const centerX=Number(shape2.getAttribute('x'))+Number(shape2.getAttribute('width'))/2
            const centerY=Number(shape2.getAttribute('y'))+Number(shape2.getAttribute('height'))/2
            //change line end to the center of shape found
            line.attr('x2',centerX).attr('y2',centerY)
            //Observable for shape found to change the coordinate of the end of line when it is being dragged 
            Observable.fromEvent<MouseEvent>(shape2,'mousedown')
            .map(({clientX, clientY}) => ({
                xOffset: Number(shape2.getAttribute('x'))+Number(shape2.getAttribute('width'))/2 - clientX,
                yOffset: Number(shape2.getAttribute('y'))+Number(shape2.getAttribute('height'))/2 - clientY,
                }))
                .flatMap(({xOffset, yOffset}) =>
                    mousemove
                    .takeUntil(mouseup)
                    .map(({clientX, clientY}) => ({
                    x: clientX + xOffset,
                    y: clientY + yOffset
                    })))
                .subscribe(({x, y}) =>{
                    line.attr('x2', x)
                    .attr('y2', y)
                })
            //push the combination where 2 shapes are linked to linkList as record
            linkList.push([shape.elem,shape2])
        }
        else if(shape2IsCircle!=undefined){
            //same idea as rectangle and square above
            const shape2=shape2IsCircle
            line.attr('x2',shape2.getAttribute('cx')).attr('y2',shape2.getAttribute('cy'))
            Observable.fromEvent<MouseEvent>(shape2,'mousedown')
            .map(({clientX, clientY}) => ({
                xOffset: Number(shape2.getAttribute('cx')) - clientX,
                yOffset: Number(shape2.getAttribute('cy')) - clientY
                }))
                .flatMap(({xOffset, yOffset}) =>
                    mousemove
                    .takeUntil(mouseup)
                    .map(({clientX, clientY}) => ({
                    x: clientX + xOffset,
                    y: clientY + yOffset
                    })))
                .subscribe(({x, y}) =>{
                    line.attr('x2', x)
                    .attr('y2', y);
                    })
                linkList.push([shape.elem,shape2])
        }
        else if(shape2IsEllipse!=undefined){
            //same idea as rectangle and square above
            const shape2=shape2IsEllipse
            line.attr('x2',shape2.getAttribute('cx')).attr('y2',shape2.getAttribute('cy'))
            Observable.fromEvent<MouseEvent>(shape2,'mousedown')
            .map(({clientX, clientY}) => ({
                xOffset: Number(shape2.getAttribute('cx')) - clientX,
                yOffset: Number(shape2.getAttribute('cy')) - clientY
                }))
                .flatMap(({xOffset, yOffset}) =>
                    mousemove
                    .takeUntil(mouseup)
                    .map(({clientX, clientY}) => ({
                    x: clientX + xOffset,
                    y: clientY + yOffset
                    })))
                .subscribe(({x, y}) =>{
                    line.attr('x2', x)
                    .attr('y2', y);
                    })
                linkList.push([shape.elem,shape2])
        }
        else{
            //if all are undefined then we have to remove line as we are not connecting shape to anything
            svg.removeChild(line.elem)
        }
}

function deleteButton(shape:Elem,num:Elem){
    //function to create delete button for shape served
    const svg=document.getElementById('diagrameditor')
    const svg2=document.getElementById('option')
    const bin=new Elem(svg2,'rect')
    .attr('x',150).attr('y',15)
    .attr('fill','gray').attr('stroke','black')
    .attr('width',100).attr('height',100).attr('cursor','pointer')
    const text=new Elem(svg2,'text')
    .attr('x',165).attr('y',70)
    .attr('fill','black').attr('cursor','pointer')
    .attr('font-weight','bold').attr('font-style','italic')
    text.elem.textContent='DELETE'

    //here's why menu bar is clear and shaped served is deleted when delete button is clicked
    bin.observe("click")
    .subscribe(()=>{
        //same here, we want to stop multitasking when resize function is used
        if(resizeAndCancelHandler){
            let connector=connectorFinder(shape) //list to store the served shape's link(s)
            //if connector list is not empty, it means shape has link(s) and then all links will be removed
            if(connector.length!=0){
                connector.forEach(item=>svg.removeChild(item))
            }
            //since we want to delete the shape, we also have to clear out all combinations that exist this shape in linkList
            for(let i=0,l=linkList.length;i<l;i++){
                if(linkList[i][0]==shape.elem||linkList[i][1]==shape.elem){
                    linkList[i]=[]
                }
            }
            //at the end remove shape and its number and clean up the menu bar
            svg.removeChild(shape.elem)
            svg.removeChild(num.elem)
            clearOption()
        }
    })

    //Observable for delete button effects
    bin.observe('mouseover')
    .subscribe(()=>{
        if(resizeAndCancelHandler){
            bin.attr('fill','yellow')
            .attr('stroke-dasharray',5)
        }
        else{
            //effect showing that button is not allowed to use
            bin.attr('cursor','not-allowed')
        }
    })

    //recover original button's attributes
    bin.observe('mouseout')
    .subscribe(()=>{
        if(resizeAndCancelHandler){
            bin.attr('fill','gray')
            .attr('stroke-dasharray',0)
        }
        else{
            //set the attribute back to the original one
            bin.attr('cursor','pointer')
        }
    })

    //same here, we do what we do for bin as user might click on text instead of grey part(bin)
    text.observe("click")
    .subscribe(()=>{
        if(resizeAndCancelHandler){
            let connector=connectorFinder(shape)
            if(connector.length!=0){
                connector.forEach(item=>svg.removeChild(item))
            }
            for(let i=0,l=linkList.length;i<l;i++){
                if(linkList[i][0]==shape.elem||linkList[i][1]==shape.elem){
                    linkList[i]=[]
                }
            }
            svg.removeChild(shape.elem)
            svg.removeChild(num.elem)
            clearOption()
        }
    })
    
    text.observe('mouseover')
    .subscribe(()=>{
        if(resizeAndCancelHandler){
            bin.attr('fill','yellow')
            .attr('stroke-dasharray',5.5)
        }
        else{
            text.attr('cursor','not-allowed')
        }
    })

    text.observe('mouseout')
    .subscribe(()=>{
        if(resizeAndCancelHandler){
            bin.attr('fill','gray')
            .attr('stroke-dasharray',0)
        }
        else{
            text.attr('cursor','pointer')
        }
    })
}

function resizeButton(shape:Elem,shapelabel:string,num:Elem){
    //function to create resize button
    const svg=document.getElementById('diagrameditor')
    const svg2=document.getElementById('option')
    const resize=new Elem(svg2,'rect')
    .attr('x',295).attr('y',15)
    .attr('fill','gray').attr('stroke','black')
    .attr('width',100).attr('height',100).attr('cursor','pointer')
    const text=new Elem(svg2,'text')
    .attr('x',315).attr('y',70)
    .attr('fill','black').attr('cursor','pointer')
    .attr('font-weight','bold').attr('font-style','italic')
    text.elem.textContent='RESIZE'

    //Observing when resize button is clicked, resize button is removed and replaced by cancel button
    //at the same time, main function for setting up resize observable is also called
    resize.observe("click")
    .subscribe(()=>{
        //linkHandler to control whether user is allowed to use resize because he/she might be drawing line
        if(linkHandler){
            svg2.removeChild(resize.elem)
            let cancel=cancelButton(shape,shapelabel,num)
            resizeObservable(shape,shapelabel,cancel,num)
        }
    })

    //Observable for resize button effects
    resize.observe('mouseover')
    .subscribe(()=>{
        linkHandler=linkChecker(shape)
        if(linkHandler){
            resize.attr('fill','yellow')
            .attr('stroke-dasharray',5)
        }
        else{
            //effect showing that button is not allowed to use
            resize.attr('cursor','not-allowed')
        }
    })

    //recovering the orginal attributes of resize button
    resize.observe('mouseout')
    .subscribe(()=>{
        if(linkHandler){
            resize.attr('fill','gray')
            .attr('stroke-dasharray',0)
        }
        else{
            //recover cursor attribute
            resize.attr('cursor','pointer')
        }
    })
    
    //same here as what I did above
    text.observe("click")
    .subscribe(()=>{
        if(linkHandler){
            svg2.removeChild(resize.elem)
            let cancel=cancelButton(shape,shapelabel,num)
            resizeObservable(shape,shapelabel,cancel,num)
        }
    })
    
    text.observe('mouseover')
    .subscribe(()=>{
        linkHandler=linkChecker(shape)
        if(linkHandler){
            resize.attr('fill','yellow')
            .attr('stroke-dasharray',5.5)
        }
        else{
            text.attr('cursor','not-allowed')
        }
    })

    text.observe('mouseout')
    .subscribe(()=>{
        if(linkHandler){
            resize.attr('fill','gray')
            .attr('stroke-dasharray',0)
        }
        else{
            text.attr('cursor','pointer')
        }
    })
}

function cancelButton(shape:Elem,shapelabel:string,num:Elem){
    //function to create a cancel button
    const svg=document.getElementById('diagrameditor')
    const svg2=document.getElementById('option')
    const cancel=new Elem(svg2,'rect')
    .attr('x',295).attr('y',15)
    .attr('fill','gray').attr('stroke','black')
    .attr('width',100).attr('height',100).attr('cursor','pointer')
    const text=new Elem(svg2,'text')
    .attr('x',312.5).attr('y',70)
    .attr('fill','black').attr('cursor','pointer')
    .attr('font-weight','bold').attr('font-style','italic')
    text.elem.textContent='CANCEL'

    //if cancel button is clicked, then cancel is replaced by resize button
    //if resize frame exists, remove it
    //turn back all the handler to allow user to choose any of them
    cancel.observe<MouseEvent>("click")
    .subscribe(()=>{
        svg2.removeChild(cancel.elem)
        resizeButton(shape,shapelabel,num)
        if(resizeAndCancelList.length!=0){
            removeFrame(resizeAndCancelList.pop())
            resizeAndCancelHandler=true
            linkHandler=true
        }
    })

    //same here as what we did for delete and resize button
    cancel.observe('mouseover')
    .subscribe(()=>{
        cancel.attr('fill','yellow')
        .attr('stroke-dasharray',5)
    })

    cancel.observe('mouseout')
    .subscribe(()=>{
        cancel.attr('fill','gray')
        .attr('stroke-dasharray',0)
    })

    text.observe("click")
    .subscribe(()=>{
        svg2.removeChild(cancel.elem)
        resizeButton(shape,shapelabel,num)
        if(resizeAndCancelList.length!=0){
            removeFrame(resizeAndCancelList.pop())
            resizeAndCancelHandler=true
            linkHandler=true
        }
    })
    
    text.observe('mouseover')
    .subscribe(()=>{
        cancel.attr('fill','yellow')
        .attr('stroke-dasharray',5.5)
    })

    text.observe('mouseout')
    .subscribe(()=>{
        cancel.attr('fill','gray')
        .attr('stroke-dasharray',0)
    })
    //cancel and text are returned for setting observable on them and also for gaining control on them 
    return [cancel,text]
}

function resizeObservable(shape:Elem,shapelabel:string,cancel:Elem[],num:Elem){
    //function to set up resize frame and observable for resizing and removing frame
    const svg=document.getElementById('diagrameditor')
    if(shapelabel=='rect'||shapelabel=='square'){
        //why I did not calculate all the points is because same x and y coordinate will happen for each certain point
        const topLeftX = Number(shape.attr('x')) 
        const topLeftY = Number(shape.attr('y'))
        const topRightX = topLeftX+Number(shape.attr('width'))
        const bottomLeftY = topLeftY+Number(shape.attr('height'))
        const centerX = topLeftX+Number(shape.attr('width'))/2
        const centerY = topLeftY+Number(shape.attr('height'))/2
        const frame=resizeFrame(shape,shapelabel,topLeftX,topRightX,
            topLeftY,bottomLeftY,centerX,centerY)
            resizeAndCancelList.push(frame) //recording frame used
            resizeAndCancelHandler=false //block user from using function other than resize function
            resizeFrameObservable(frame,shape,shapelabel,num)
            removeFrameObservable(frame,cancel)
    }
    else if(shapelabel=='circle'){
        //same idea as rectangle and square 
        const topLeftX = Number(shape.attr('cx'))-Number(shape.attr('r'))
        const topLeftY = Number(shape.attr('cy'))-Number(shape.attr('r'))
        const topRightX = topLeftX+Number(shape.attr('r'))*2
        const bottomLeftY = topLeftY+Number(shape.attr('r'))*2
        const centerX = Number(shape.attr('cx'))
        const centerY = Number(shape.attr('cy'))
        const frame=resizeFrame(shape,shapelabel,topLeftX,topRightX,
            topLeftY,bottomLeftY,centerX,centerY)
            resizeAndCancelList.push(frame)
            resizeAndCancelHandler=false
            resizeFrameObservable(frame,shape,shapelabel,num)
            removeFrameObservable(frame,cancel)
    }
    else{
        //same idea as rectangle and square
        const topLeftX = Number(shape.attr('cx'))-Number(shape.attr('rx'))
        const topLeftY = Number(shape.attr('cy'))-Number(shape.attr('ry'))
        const topRightX = topLeftX+Number(shape.attr('rx'))*2
        const bottomLeftY = topLeftY+Number(shape.attr('ry'))*2
        const centerX = Number(shape.attr('cx'))
        const centerY = Number(shape.attr('cy'))
        const frame=resizeFrame(shape,shapelabel,topLeftX,topRightX,
            topLeftY,bottomLeftY,centerX,centerY)
            resizeAndCancelList.push(frame)
            resizeAndCancelHandler=false
            resizeFrameObservable(frame,shape,shapelabel,num)
            removeFrameObservable(frame,cancel)
    }
}

function resizeFrame(shape:Elem,shapelabel:string,x1:number,x2:number,
                    y1:number,y2:number,a1:number,b1:number):Elem[]{
    //function to construct resize frame for shape served
    //here we have 4 lines and 9 dots
    //note that ids for dots are allowing me to determine which dot it is 

    /*
            this is my idea for constructing my frame 
            :dot index (x coordinate type,y coordinate type)
            e.g. dot4(1,1) is dot in frameList[4] with id 11 as well as x1,y1
            (Note that dot4 is not const dot4 shown here)
            
            dot4(1,1)----dot8(3,1)----dot5(2,1)
            |                                 |
            dot11(1,3)                 dot9(2,3)
            |                                 |
            dot7(1,2)----dot10(3,2)---dot6(2,2)

    */
    const svg=document.getElementById('diagrameditor')
    const line1=new Elem(svg,'line')
    .attr('x1',x1).attr('y1',y1)
    .attr('x2',x2).attr('y2',y1).attr('id','line')//0
    .attr('stroke','black').attr('stroke-width',2).attr('stroke-dasharray',10)
    const line2=new Elem(svg,'line')
    .attr('x1',x2).attr('y1',y1)
    .attr('x2',x2).attr('y2',y2).attr('id','line')//1
    .attr('stroke','black').attr('stroke-width',2).attr('stroke-dasharray',10)
    const line3=new Elem(svg,'line')
    .attr('x1',x1).attr('y1',y2)
    .attr('x2',x2).attr('y2',y2).attr('id','line')//2
    .attr('stroke','black').attr('stroke-width',2).attr('stroke-dasharray',10)
    const line4=new Elem(svg,'line')
    .attr('x1',x1).attr('y1',y1)
    .attr('x2',x1).attr('y2',y2).attr('id','line')//3
    .attr('stroke','black').attr('stroke-width',2).attr('stroke-dasharray',10)
    const dot1=new Elem(svg,'circle').attr('id','dot11')//4
    .attr('cx',x1).attr('cy',y1)
    .attr('r',6).attr('fill','gray').attr('cursor','move')
    const dot2=new Elem(svg,'circle').attr('id','dot21')//5
    .attr('cx',x2).attr('cy',y1)
    .attr('r',6).attr('fill','gray').attr('cursor','move')
    const dot3=new Elem(svg,'circle').attr('id','dot22')//6
    .attr('cx',x2).attr('cy',y2)
    .attr('r',6).attr('fill','gray').attr('cursor','move')
    const dot4=new Elem(svg,'circle').attr('id','dot12')//7
    .attr('cx',x1).attr('cy',y2)
    .attr('r',6).attr('fill','gray').attr('cursor','move')
    const dot5=new Elem(svg,'circle').attr('id','dot31')//8
    .attr('cx',a1).attr('cy',y1)
    .attr('r',6).attr('fill','gray').attr('cursor','move')
    const dot6=new Elem(svg,'circle').attr('id','dot23')//9
    .attr('cx',x2).attr('cy',b1)
    .attr('r',6).attr('fill','gray').attr('cursor','move')
    const dot7=new Elem(svg,'circle').attr('id','dot32')//10
    .attr('cx',a1).attr('cy',y2)
    .attr('r',6).attr('fill','gray').attr('cursor','move')
    const dot8=new Elem(svg,'circle').attr('id','dot13')//11
    .attr('cx',x1).attr('cy',b1)
    .attr('r',6).attr('fill','gray').attr('cursor','move')
    //returning all 4 lines and 9 dots is to pass to resize and remove Observable in order to gain control and 
    return [line1,line2,line3,line4,dot1,dot2,dot3,dot4,dot5,dot6,dot7,dot8]
}

function resizeFrameObservable(frameList:Elem[],shape:Elem,shapelabel:string,num:Elem){
    //function to allow user to changing shape's size according to which dot is being dragged
    const svg=document.getElementById('diagrameditor')
    const mouseclick = Observable.fromEvent<MouseEvent>(svg, "click")
    const mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove')
    const mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup')
    const mousedown = Observable.fromEvent<MouseEvent>(svg, 'mousedown')
    //here I only set observable for items from index 4 to 11 which are all dots
    //because lines properties are controlled by dots, so is shape's size 
    for(let i=4,l=8;i<l;i++){
        //this code is somehow similar to dragging shape for changing line's position 
        frameList[i].observe<MouseEvent>('mousedown')
        .map(({clientX, clientY}) => ({
        xOffset: Number(frameList[i].attr('cx')) - clientX,
        yOffset: Number(frameList[i].attr('cy')) - clientY,
        }))
        .flatMap(({xOffset, yOffset}) =>
            mousemove
            .takeUntil(mouseup)
            .filter(({clientX})=>clientX-svg.getBoundingClientRect().left>=200) //here I stop user from going beyond the boundary of palette
            .map(({clientX, clientY}) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
            })))
        .subscribe(({x, y}) =>{
            let id=frameList[i].attr('id')
            /*
            this is my idea for constructing my frame 
            :dot index (x coordinate type,y coordinate type)
            e.g. dot4(1,1) is dot in frameList[4] with id 11 as well as x1,y1
            (Note that dot4 is not const dot4 shown above but an index of frameList)

            dot4(1,1)----dot8(3,1)----dot5(2,1)
            |                                 |
            dot11(1,3)                 dot9(2,3)
            |                                 |
            dot7(1,2)----dot10(3,2)---dot6(2,2)

            */
            //if-else statement check y coordinate type followed by x coordinate type
            //and modification is made only for those dots with respective x and y coordinate type
            //for dot8,9,10,11, I divide relavant coordinates by 2(have a look with tag '$$$$$') 
            if(id.slice(-1)=='1'){
                frameList[4].attr('cy', y)
                frameList[5].attr('cy', y)
                frameList[8].attr('cy', y).attr('cx',(Number(frameList[4].attr('cx'))+Number(frameList[5].attr('cx')))/2)//$$$$$
                frameList[10].attr('cx',(Number(frameList[4].attr('cx'))+Number(frameList[5].attr('cx')))/2)//$$$$$
                if(id.slice(-2,-1)=='1'){
                    frameList[4].attr('cx',x)
                    frameList[7].attr('cx',x)        
                    frameList[11].attr('cx',x)
                    frameList[0].attr('x1',x).attr('y1',y).attr('y2',y)
                    frameList[1].attr('y1',y)
                    frameList[2].attr('x1',x)
                    frameList[3].attr('x1',x).attr('y1',y).attr('x2',x)
                }
                else if(id.slice(-2,-1)=='2'){
                    frameList[5].attr('cx',x)
                    frameList[6].attr('cx',x)        
                    frameList[9].attr('cx',x)
                    frameList[0].attr('x2',x).attr('y2',y).attr('y1',y)
                    frameList[1].attr('x1',x).attr('y1',y).attr('x2',x)
                    frameList[2].attr('x2',x)
                    frameList[3].attr('y1',y)
                }
                frameList[11].attr('cy',(Number(frameList[4].attr('cy'))+Number(frameList[7].attr('cy')))/2)//$$$$$
                frameList[9].attr('cy',(Number(frameList[4].attr('cy'))+Number(frameList[7].attr('cy')))/2)//$$$$$
            }
            else if(id.slice(-1)=='2'){
                frameList[6].attr('cy', y)
                frameList[7].attr('cy', y)
                frameList[10].attr('cy', y).attr('cx',(Number(frameList[6].attr('cx'))+Number(frameList[7].attr('cx')))/2)//$$$$$
                frameList[8].attr('cx',(Number(frameList[6].attr('cx'))+Number(frameList[7].attr('cx')))/2)//$$$$$
                if(id.slice(-2,-1)=='1'){
                    frameList[4].attr('cx',x)
                    frameList[7].attr('cx',x)        
                    frameList[11].attr('cx',x)
                    frameList[0].attr('x1',x)
                    frameList[1].attr('y2',y)
                    frameList[2].attr('x1',x).attr('y1',y).attr('y2',y)
                    frameList[3].attr('x2',x).attr('y2',y).attr('x1',x)
                    
                }
                else if(id.slice(-2,-1)=='2'){
                    frameList[5].attr('cx',x)
                    frameList[6].attr('cx',x)        
                    frameList[9].attr('cx',x)
                    frameList[0].attr('x2',x)
                    frameList[1].attr('x1',x).attr('y2',y).attr('x2',x)
                    frameList[2].attr('x2',x).attr('y2',y).attr('y1',y)
                    frameList[3].attr('y2',y)
                }
                frameList[11].attr('cy',(Number(frameList[4].attr('cy'))+Number(frameList[7].attr('cy')))/2)//$$$$$
                frameList[9].attr('cy',(Number(frameList[4].attr('cy'))+Number(frameList[7].attr('cy')))/2)//$$$$$
            }
            //shapeX and shapeY here are the minimum coordinates of dot 4,5,6,7 even if user wraps around
            //and shape'size is based on these 4 dots' attributes 
            let shapeX=Math.min(Number(frameList[4].attr('cx')),Number(frameList[5].attr('cx')),Number(frameList[6].attr('cx')),Number(frameList[7].attr('cx')))
            let shapeY=Math.min(Number(frameList[4].attr('cy')),Number(frameList[5].attr('cy')),Number(frameList[6].attr('cy')),Number(frameList[7].attr('cy')))
                if(shapelabel=='rect'||shapelabel=='square'){
                    shape.attr('x',shapeX).attr('y',shapeY)
                    .attr('width',Math.abs(Number(frameList[5].attr('cx'))-Number(frameList[4].attr('cx'))))
                    .attr('height',Math.abs(Number(frameList[7].attr('cy'))-Number(frameList[4].attr('cy'))))

                    //here is why my shape's number remains at the top left position even if user is resizing the shape
                    num.attr('x',shapeX).attr('y',shapeY) 
                }
                else if(shapelabel=='circle'){
                    shape.attr('cx',frameList[8].attr('cx')).attr('cy',frameList[9].attr('cy'))
                    .attr('r',Math.abs(Number(frameList[8].attr('cx'))-Number(frameList[9].attr('cx'))))

                    num.attr('x',shapeX).attr('y',shapeY)
                }
                else{
                    shape.attr('cx',frameList[8].attr('cx')).attr('cy',frameList[9].attr('cy'))
                    .attr('rx',Math.abs(Number(frameList[8].attr('cx'))-Number(frameList[9].attr('cx'))))
                    .attr('ry',Math.abs(Number(frameList[8].attr('cy'))-Number(frameList[9].attr('cy'))))

                    num.attr('x',shapeX).attr('y',shapeY)
                }
        })
    }
    //same idea as what I did above for dot 4,5,6,7
    for(let i=8,l=12;i<l;i++){
        frameList[i].observe<MouseEvent>('mousedown')
        .map(({clientX, clientY}) => ({
        xOffset: Number(frameList[i].attr('cx')) - clientX,
        yOffset: Number(frameList[i].attr('cy')) - clientY
        }))
        .flatMap(({xOffset, yOffset}) =>
            mousemove
            .takeUntil(mouseup)
            .filter(({clientX})=>clientX-svg.getBoundingClientRect().left>=200)
            .map(({clientX, clientY}) => ({
            x: clientX + xOffset,
            y: clientY + yOffset,
            })))
        .subscribe(({x, y}) =>{
            let id=frameList[i].attr('id')
            if(id.slice(-2)=='31'){
                frameList[4].attr('cy', y)
                frameList[5].attr('cy', y)
                frameList[8].attr('cy', y)
                frameList[0].attr('y1',y).attr('y2',y)
                frameList[1].attr('y1',y)
                frameList[3].attr('y1',y)
                frameList[11].attr('cy',(Number(frameList[4].attr('cy'))+Number(frameList[7].attr('cy')))/2)
                frameList[9].attr('cy',(Number(frameList[4].attr('cy'))+Number(frameList[7].attr('cy')))/2)
            }
            else if(id.slice(-2)=='13'){
                frameList[4].attr('cx',x)
                frameList[7].attr('cx',x)        
                frameList[11].attr('cx',x)
                frameList[0].attr('x1',x)
                frameList[2].attr('x1',x)
                frameList[3].attr('x1',x).attr('x2',x)
                frameList[10].attr('cx',(Number(frameList[6].attr('cx'))+Number(frameList[7].attr('cx')))/2)
                frameList[8].attr('cx',(Number(frameList[6].attr('cx'))+Number(frameList[7].attr('cx')))/2)
            }
            else if(id.slice(-2)=='32'){
                frameList[6].attr('cy', y)
                frameList[7].attr('cy', y)
                frameList[10].attr('cy', y)
                frameList[1].attr('y2',y)
                frameList[2].attr('y1',y).attr('y2',y)
                frameList[3].attr('y2',y)
                frameList[11].attr('cy',(Number(frameList[4].attr('cy'))+Number(frameList[7].attr('cy')))/2)
                frameList[9].attr('cy',(Number(frameList[4].attr('cy'))+Number(frameList[7].attr('cy')))/2)
            }
            else if(id.slice(-2)=='23'){
                frameList[5].attr('cx',x)
                frameList[6].attr('cx',x)        
                frameList[9].attr('cx',x)
                frameList[0].attr('x2',x)
                frameList[1].attr('x1',x).attr('x2',x)
                frameList[2].attr('x2',x)
                frameList[10].attr('cx',(Number(frameList[6].attr('cx'))+Number(frameList[7].attr('cx')))/2)
                frameList[8].attr('cx',(Number(frameList[6].attr('cx'))+Number(frameList[7].attr('cx')))/2)
            }
            
            let shapeX=Math.min(Number(frameList[4].attr('cx')),Number(frameList[5].attr('cx')),Number(frameList[6].attr('cx')),Number(frameList[7].attr('cx')))
            let shapeY=Math.min(Number(frameList[4].attr('cy')),Number(frameList[5].attr('cy')),Number(frameList[6].attr('cy')),Number(frameList[7].attr('cy')))
                if(shapelabel=='rect'||shapelabel=='square'){
                    shape.attr('x',shapeX).attr('y',shapeY)
                    .attr('width',Math.abs(Number(frameList[5].attr('cx'))-Number(frameList[4].attr('cx'))))
                    .attr('height',Math.abs(Number(frameList[7].attr('cy'))-Number(frameList[4].attr('cy'))))

                    num.attr('x',shapeX).attr('y',shapeY)
                }
                else if(shapelabel=='circle'){
                    shape.attr('cx',frameList[8].attr('cx')).attr('cy',frameList[9].attr('cy'))
                    .attr('r',Math.abs(Number(frameList[8].attr('cx'))-Number(frameList[9].attr('cx'))))

                    num.attr('x',shapeX).attr('y',shapeY)
                }
                else{
                    shape.attr('cx',frameList[8].attr('cx')).attr('cy',frameList[9].attr('cy'))
                    .attr('rx',Math.abs(Number(frameList[8].attr('cx'))-Number(frameList[9].attr('cx'))))
                    .attr('ry',Math.abs(Number(frameList[8].attr('cy'))-Number(frameList[9].attr('cy'))))

                    num.attr('x',shapeX).attr('y',shapeY)
                }
        })
    }
}

function removeFrame(frameList:Elem[]){
    //function to delete resize frame
    const svg=document.getElementById('diagrameditor')
    for(let i=0,l=frameList.length;i<l;i++){
        svg.removeChild(frameList[i].elem)
    }
}

function removeFrameObservable(frameList:Elem[],cancel:Elem[]){
    //function to allow cancel button in controlling removing resize frame
    const svg=document.getElementById('diagrameditor')
    //cancel[0] is grey part of cancel button
    //cancel[1] is the text 'CANCEL'
    //if clicked, then frame will be removed
    cancel[0].observe<MouseEvent>("click")
    .subscribe(()=>{
        removeFrame(frameList)
    })
    cancel[1].observe<MouseEvent>("click")
    .subscribe(()=>{
        removeFrame(frameList)
    })
}

function dragShapeObservable(shape:Elem,shapelabel:string,num:Elem) {
    //function to allow shape to be able to be dragged and turn on/off some handlers
    //also to activate the blinking color animation for shape served and menu showing observable
    const svg = document.getElementById("diagrameditor")
    const {left, top} = svg.getBoundingClientRect()
    const mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove')
    const mouseup = Observable.fromEvent<MouseEvent>(svg, 'mouseup')
    if(shapelabel=='rect'||shapelabel=='square'){
        //similar Observable shown above and it is actually the resource from given basicexample.ts file
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
            y: clientY + yOffset,
            })))
        .subscribe(({x, y}) =>{
            shape.attr('x', x)
            .attr('y', y)
            num.attr('x',x)//shape's number is following shape while shape is being dragged
            .attr('y',y)
            currentShapeNum=Number(num.elem.textContent)
            if(resizeAndCancelList.length!=0){
                removeFrame(resizeAndCancelList.pop())
                resizeAndCancelHandler=true
                linkHandler=true
            }
            draggedShapeAnimation(shape,shapelabel,num)
        })
        showOptionObservable(shape,shapelabel,num)
    }
    else{
        //same idea as what I did for rectangle and square above
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
            .attr('cy', y)
            num.attr('x',x-Number(shape.attr('r')))
            .attr('y',y-Number(shape.attr('r')))
            currentShapeNum=Number(num.elem.textContent)
            if(resizeAndCancelList.length!=0){
                removeFrame(resizeAndCancelList.pop())
                resizeAndCancelHandler=true
                linkHandler=true
            }
            draggedShapeAnimation(shape,shapelabel,num)
        })
        showOptionObservable(shape,shapelabel,num)
    }
}

function createShape(shapelabel:string,num:number){
    //function to create each shape as initial step according to given label 
    const svg=document.getElementById('diagrameditor')
    if(shapelabel=='rect'){
        const rect = new Elem(svg, 'rect')
        .attr('x', 30).attr('y', 50)
        .attr('width', 120).attr('height', 80)
        .attr('fill', 'red').attr('cursor','move')
        .attr('id','rect')
        const text=new Elem(svg,'text')
        .attr('x',30).attr('y',50).attr('fill','black')
        .attr('font-weight','bold').attr('font-style','italic')
        text.elem.textContent=String(num)
        dragShapeObservable(rect,'rect',text)//here's why all my shapes are able to be dragged

        //one-time event for each shape
        //when it is dragged from palette, new shape is created as backup
        const clickAndCreate=rect.observe<MouseEvent>('mousedown')
        .takeUntil(rect.observe<MouseEvent>("click"))
        .subscribe(()=>{
            //here is how I handle for those bug when I just click on shape from palette instead of dragging them
            //I set a timer as invalid shape cleaner to clean up those shapes fall within the palette
            //and avoid boundary checker
            let handle=setInterval(()=>{
                if(Number(rect.attr('x'))<200){
                    svg.removeChild(rect.elem)
                    svg.removeChild(text.elem)
                    clearOption()//since menu showing observable is called, menu bar for deleted shape has to be remove as well
                    clearInterval(handle)//then we kill the timer
                }
            },3000)
            createShape(shapelabel,num+1)
        })
        checkBoundary(rect,shapelabel,text)//setting boundary cheaker
    }
    else if(shapelabel=='square'){
        //same as rectangle
        const square = new Elem(svg, 'rect')
        .attr('x', 40).attr('y', 150)
        .attr('rx',30).attr('ry',30)
        .attr('width', 100).attr('height', 100)
        .attr('fill', 'green').attr('cursor','move')
        .attr('id','square')
        const text=new Elem(svg,'text')
        .attr('x',40).attr('y',150).attr('fill','black')
        .attr('font-weight','bold').attr('font-style','italic')
        text.elem.textContent=String(num)
        dragShapeObservable(square,'square',text)
        const clickAndCreate=square.observe<MouseEvent>('mousedown')
        .takeUntil(square.observe<MouseEvent>("click"))
        .subscribe(()=>{
            let handle=setInterval(()=>{
                if(Number(square.attr('x'))<200){
                    svg.removeChild(square.elem)
                    svg.removeChild(text.elem)
                    clearOption()
                    clearInterval(handle)
                }
            },3000)
            createShape(shapelabel,num+1)
        })
        checkBoundary(square,shapelabel,text)
    }
    else if(shapelabel=='circle'){
        //same as rectangle
        const circle = new Elem(svg, 'circle')
        .attr('cx', 90).attr('cy', 320).attr('r',50)
        .attr('fill', 'blue').attr('cursor','move')
        .attr('id','circle')
        const text=new Elem(svg,'text')
        .attr('x',40).attr('y',270).attr('fill','black')
        .attr('font-weight','bold').attr('font-style','italic')
        text.elem.textContent=String(num)
        dragShapeObservable(circle,'circle',text)
        const clickAndCreate=circle.observe<MouseEvent>('mousedown')
        .takeUntil(circle.observe<MouseEvent>("click"))
        .subscribe(()=>{
            let handle=setInterval(()=>{
                if(Number(circle.attr('cx'))-Number(circle.attr('r'))<200){
                    svg.removeChild(circle.elem)
                    svg.removeChild(text.elem)
                    clearOption()
                    clearInterval(handle)
                }
            },3000)
            createShape(shapelabel,num+1)
        })
        checkBoundary(circle,shapelabel,text)
    }
    else{
        //same as rectangle
        const ellipse = new Elem(svg, 'ellipse')
        .attr('cx', 90).attr('cy', 440)
        .attr('rx',70).attr('ry',50).attr('r',50)
        .attr('fill', 'orange').attr('cursor','move')
        .attr('id','ellipse')
        const text=new Elem(svg,'text')
        .attr('x',40).attr('y',390).attr('fill','black')
        .attr('font-weight','bold').attr('font-style','italic')
        text.elem.textContent=String(num)
        dragShapeObservable(ellipse,'ellipse',text)
        const clickAndCreate=ellipse.observe<MouseEvent>('mousedown')
        .takeUntil(ellipse.observe<MouseEvent>("click"))
        .subscribe(()=>{
            let handle=setInterval(()=>{
                if(Number(ellipse.attr('cx'))-Number(ellipse.attr('rx'))<200){
                    svg.removeChild(ellipse.elem)
                    svg.removeChild(text.elem)
                    clearOption()
                    clearInterval(handle)
                }
            },3000)
            createShape(shapelabel,num+1)
        })
        checkBoundary(ellipse,shapelabel,text)
    }
}

function createBoundary(){
    //function to draw a line to split playground with palette
    const svg=document.getElementById('diagrameditor')
    const svgBounds=svg.getBoundingClientRect()
    const boundary=new Elem(svg,'line')
        .attr('x1',200)
        .attr('y1',svgBounds.top+550)
        .attr('x2',200)
        .attr('y2',0)
        .attr('stroke','black')
        .attr('stroke-width',3)
}

function checkBoundary(shape:Elem,shapelabel:string,num:Elem){
    //function to check whether shape touchs the boundary
    const svg=document.getElementById('diagrameditor')
    if(shapelabel=='rect'||shapelabel=='square'){
        //recall that click starts with mousedown and ends with mouseup
        // when user drags and drop the shape and the shape overlaps with boundary, then it will be deleted
        const shapeGuard=shape.observe<MouseEvent>("click")
        .filter(()=> Number(shape.attr('x'))<200)
        .subscribe(_=>{
            let connector=connectorFinder(shape)
            if(connector!=[]){
                connector.forEach(item=>svg.removeChild(item))
            }
            for(let i=0,l=linkList.length;i<l;i++){
                if(linkList[i][0]==shape.elem||linkList[i][1]==shape.elem){
                    linkList[i]=[]
                }
            }
            svg.removeChild(shape.elem);
            svg.removeChild(num.elem);
            clearOption()//same here, we have to remove menu bar for deleted shape
        })
    }
    else if(shapelabel=='circle'){
        //same idea as rectangel and square
        const shapeGuard=shape.observe<MouseEvent>("click")
        .filter(()=> (Number(shape.attr('cx'))-Number(shape.attr('r')))<200)
        .subscribe(_=>{
            let connector=connectorFinder(shape)
            if(connector!=[]){
                connector.forEach(item=>svg.removeChild(item))
            }
            for(let i=0,l=linkList.length;i<l;i++){
                if(linkList[i][0]==shape.elem||linkList[i][1]==shape.elem){
                    linkList[i]=[]
                }
            }
            svg.removeChild(shape.elem);
            svg.removeChild(num.elem);
            clearOption()
        })
    }
    else{
        //same idea as rectangel and square
        const shapeGuard=shape.observe<MouseEvent>("click")
        .filter(()=> (Number(shape.attr('cx'))-Number(shape.attr('rx')))<200)
        .subscribe(_=>{
            let connector=connectorFinder(shape)
            if(connector!=[]){
                connector.forEach(item=>svg.removeChild(item))
            }
            for(let i=0,l=linkList.length;i<l;i++){
                if(linkList[i][0]==shape.elem||linkList[i][1]==shape.elem){
                    linkList[i]=[]
                }
            }
            svg.removeChild(shape.elem);
            svg.removeChild(num.elem);
            clearOption()
        })
    }
}

function draggedShapeAnimation(shape:Elem,shapelabel:string,num:Elem){
    //function to create animation for shape served by changing color after certain milliseconds
    let colorList:String[]=['red','orange','yellow','green','blue','purple']
    let count=0
    let blinkColor=setInterval(()=>{
        if(Number(num.elem.textContent)==currentShapeNum){
            //count modulus size of color list will allow interval to run the list like a circle (from FIT1008 circular queue)
            shape.attr('fill',String(colorList[count%colorList.length]))
            count+=1
        }
        else{
            //if shape's number is not the same, then change their shape's color back to original one
            if(shapelabel=='rect'){shape.attr('fill','red')}
            else if(shapelabel=='square'){shape.attr('fill','green')}
            else if(shapelabel=='circle'){shape.attr('fill','blue')}
            else{shape.attr('fill','orange')}
            clearInterval(blinkColor)//interval is also killed here
        }
    },500)
}
if (typeof window != 'undefined')
window.onload = ()=>{
    createBoundary()
    createShape('rect',1001)//number for labelling these 4 shapes is changeable!!!
    createShape('square',2001)//number for labelling these 4 shapes is changeable!!!
    createShape('circle',3001)//number for labelling these 4 shapes is changeable!!!
    createShape('ellipse',4001)//number for labelling these 4 shapes is changeable!!!
}