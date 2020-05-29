let resizeAndCancelList = [];
let resizeAndCancelHandler = true;
let linkList = [];
let linkHandler = true;
let currentShapeNum;
function linkChecker(shape) {
    for (let i = 0, l = linkList.length; i < l; i++) {
        if (linkList[i][0] == shape.elem || linkList[i][1] == shape.elem) {
            return false;
        }
    }
    return true;
}
function connectorFinder(shape) {
    const svg = document.getElementById('diagrameditor');
    const connectorList = [];
    for (let i = 0, l = svg.childElementCount; i < l; i++) {
        let centerRSX = Number(shape.attr('x')) + Number(shape.attr('width')) / 2;
        let centerRSY = Number(shape.attr('y')) + Number(shape.attr('height')) / 2;
        let centerCEX = Number(shape.attr('cx'));
        let centerCEY = Number(shape.attr('cy'));
        let lineStartX = Number(svg.children[i].getAttribute('x1'));
        let lineStartY = Number(svg.children[i].getAttribute('y1'));
        let lineEndX = Number(svg.children[i].getAttribute('x2'));
        let lineEndY = Number(svg.children[i].getAttribute('y2'));
        let lineID = svg.children[i].getAttribute('id');
        if (((centerRSX != undefined && centerRSY != undefined) || (centerCEX != undefined && centerCEY != undefined)) && (lineID == 'link')) {
            if (((lineEndX == centerRSX && lineEndY == centerRSY) || (lineEndX == centerCEX && lineEndY == centerCEY)
                || (lineStartX == centerRSX && lineStartY == centerRSY) || (lineStartX == centerCEX && lineStartY == centerCEY))) {
                connectorList.push(svg.children[i]);
            }
        }
    }
    return connectorList;
}
function insideRectAndSquareChecker(shape, x, y) {
    const svg = document.getElementById('diagrameditor');
    for (let l = 0, i = svg.childElementCount; i - 1 >= l; i--) {
        if (svg.children[i] != undefined) {
            let ShapeID = svg.children[i].getAttribute('id');
            if (ShapeID == 'rect' || ShapeID == 'square') {
                let ShapeX = Number(svg.children[i].getAttribute('x'));
                let ShapeY = Number(svg.children[i].getAttribute('y'));
                let ShapeWidth = Number(svg.children[i].getAttribute('width'));
                let ShapeHeight = Number(svg.children[i].getAttribute('height'));
                if ((x <= ShapeX + ShapeWidth) && (y <= ShapeY + ShapeHeight)
                    && ((x - ShapeX) >= 0) && ((y - ShapeY) >= 0) && (ShapeX >= 200)
                    && (Number(shape.attr('x')) != ShapeX || Number(shape.attr('y')) != ShapeY)) {
                    return svg.children[i];
                }
            }
        }
    }
}
function insideCircleChecker(shape, x, y) {
    const svg = document.getElementById('diagrameditor');
    for (let l = 0, i = svg.childElementCount; i - 1 >= l; i--) {
        if (svg.children[i] != undefined) {
            let ShapeID = svg.children[i].getAttribute('id');
            if (ShapeID == 'circle') {
                let ShapeX = Number(svg.children[i].getAttribute('cx'));
                let ShapeY = Number(svg.children[i].getAttribute('cy'));
                let ShapeRadius = Number(svg.children[i].getAttribute('r'));
                let distance = (Math.sqrt(Math.pow((x - ShapeX), 2) + Math.pow((y - ShapeY), 2)));
                if (distance <= ShapeRadius && ShapeX - ShapeRadius >= 200 && (Number(shape.attr('cx')) != ShapeX || Number(shape.attr('cy')) != ShapeY)) {
                    return svg.children[i];
                }
            }
        }
    }
}
function insideEllipseChecker(shape, x, y) {
    const svg = document.getElementById('diagrameditor');
    for (let l = 0, i = svg.childElementCount; i - 1 >= l; i--) {
        if (svg.children[i] != undefined) {
            let ShapeID = svg.children[i].getAttribute('id');
            if (ShapeID == 'ellipse') {
                let ShapeX = Number(svg.children[i].getAttribute('cx'));
                let ShapeY = Number(svg.children[i].getAttribute('cy'));
                let ShapeRadiusX = Number(svg.children[i].getAttribute('rx'));
                let ShapeRadiusY = Number(svg.children[i].getAttribute('ry'));
                let distance = (Math.sqrt(Math.pow(((x - ShapeX) / ShapeRadiusX), 2) + Math.pow(((y - ShapeY) / ShapeRadiusY), 2)));
                if (distance <= 1 && ShapeX - ShapeRadiusX >= 200 && (Number(shape.attr('cx')) != ShapeX || Number(shape.attr('cy')) != ShapeY)) {
                    return svg.children[i];
                }
            }
        }
    }
}
function clearOption() {
    const svg2 = document.getElementById('option');
    while (svg2.firstChild) {
        svg2.removeChild(svg2.firstChild);
    }
}
function showOptionObservable(shape, shapelabel, num) {
    const svg = document.getElementById('diagrameditor');
    const svg2 = document.getElementById('option');
    shape.observe('mousedown').subscribe(() => {
        clearOption();
        lineButton(shape, shapelabel);
        deleteButton(shape, num);
        resizeButton(shape, shapelabel, num);
        const shapeNum = new Elem(svg2, 'text').attr('x', 750).attr('y', 100)
            .attr('font-size', 15).attr('font-weight', 'bold').attr('font-family', 'Monaco');
        shapeNum.elem.textContent = 'Serving:#' + num.elem.textContent;
    });
}
function lineButton(shape, shapelabel) {
    const svg2 = document.getElementById('option');
    const line = new Elem(svg2, 'line')
        .attr('x1', 10).attr('y1', 10)
        .attr('x2', 110).attr('y2', 110)
        .attr('stroke', 'purple').attr('stroke-width', 10).attr('cursor', 'pointer');
    line.observe("mousedown")
        .subscribe(() => {
        if (resizeAndCancelHandler) {
            line.attr('stroke-width', 10)
                .attr('stroke', 'purple')
                .attr('stroke-dasharray', 3);
            linkHandler = false;
            lineStartObservable(shape, shapelabel);
        }
    });
    line.observe('mouseover')
        .subscribe(() => {
        if (resizeAndCancelHandler) {
            line.attr('stroke-width', 11)
                .attr('stroke', 'yellow');
        }
        else {
            line.attr('cursor', 'not-allowed');
        }
    });
    line.observe('mouseout')
        .subscribe(() => {
        if (resizeAndCancelHandler) {
            line.attr('stroke-width', 10)
                .attr('stroke-dasharray', 0)
                .attr('stroke', 'purple');
        }
        else {
            line.attr('cursor', 'pointer');
        }
    });
}
function lineStartObservable(shape, shapelabel) {
    const svg = document.getElementById('diagrameditor');
    const mouseclick = Observable.fromEvent(svg, "click");
    const mousemove = Observable.fromEvent(svg, 'mousemove');
    const mouseup = Observable.fromEvent(svg, 'mouseup');
    const mousedown = Observable.fromEvent(svg, 'mousedown');
    if (shapelabel == 'rect' || shapelabel == 'square') {
        const line = new Elem(svg, 'line')
            .attr('x1', Number(shape.attr('x')) + Number(shape.attr('width')) / 2)
            .attr('y1', Number(shape.attr('y')) + Number(shape.attr('height')) / 2)
            .attr('x2', Number(shape.attr('x')) + Number(shape.attr('width')) / 2)
            .attr('y2', Number(shape.attr('y')) + Number(shape.attr('height')) / 2)
            .attr('stroke', 'purple')
            .attr('stroke-width', '2')
            .attr('marker-start', 'url(#connector)')
            .attr('marker-end', 'url(#connector)')
            .attr('id', 'link');
        shape.observe('mousedown')
            .map(({ clientX, clientY }) => ({
            xOffset: Number(shape.attr('x')) + Number(shape.attr('width')) / 2 - clientX,
            yOffset: Number(shape.attr('y')) + Number(shape.attr('height')) / 2 - clientY
        }))
            .flatMap(({ xOffset, yOffset }) => mousemove
            .takeUntil(mouseup)
            .map(({ clientX, clientY }) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
        })))
            .subscribe(({ x, y }) => {
            line.attr('x1', x)
                .attr('y1', y);
        });
        mousemove
            .takeUntil(mouseclick)
            .map(e => ({ event: e, svgBounds: svg.getBoundingClientRect() }))
            .map(({ event, svgBounds }) => ({
            x2: event.clientX - svgBounds.left,
            y2: event.clientY - svgBounds.top
        }))
            .subscribe(({ x2, y2 }) => {
            line.attr('x2', x2)
                .attr('y2', y2);
        });
        mousedown
            .takeUntil(mouseclick)
            .map(e => ({ event: e, svgBounds: svg.getBoundingClientRect() }))
            .map(({ event, svgBounds }) => ({
            x: event.clientX - svgBounds.left,
            y: event.clientY - svgBounds.top
        }))
            .subscribe(({ x, y }) => {
            if (connectorFinder(shape).filter(link => link == line.elem).length > 0) {
                lineEndObservable(shape, line, x, y);
            }
        });
    }
    else {
        const line = new Elem(svg, 'line')
            .attr('x1', shape.attr('cx'))
            .attr('y1', shape.attr('cy'))
            .attr('x2', shape.attr('cx'))
            .attr('y2', shape.attr('cy'))
            .attr('stroke', 'purple')
            .attr('stroke-width', '2')
            .attr('marker-start', 'url(#connector)')
            .attr('marker-end', 'url(#connector)')
            .attr('id', 'link');
        shape.observe('mousedown')
            .map(({ clientX, clientY }) => ({
            xOffset: Number(shape.attr('cx')) - clientX,
            yOffset: Number(shape.attr('cy')) - clientY,
        }))
            .flatMap(({ xOffset, yOffset }) => mousemove
            .takeUntil(mouseup)
            .map(({ clientX, clientY }) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
        })))
            .subscribe(({ x, y }) => {
            line.attr('x1', x)
                .attr('y1', y);
        });
        mousemove
            .takeUntil(mouseclick)
            .map(e => ({ event: e, svgBounds: svg.getBoundingClientRect() }))
            .map(({ event, svgBounds }) => ({
            x2: event.clientX - svgBounds.left,
            y2: event.clientY - svgBounds.top
        }))
            .subscribe(({ x2, y2 }) => {
            line.attr('x2', x2)
                .attr('y2', y2);
        });
        mousedown
            .takeUntil(mouseclick)
            .map(e => ({ event: e, svgBounds: svg.getBoundingClientRect() }))
            .map(({ event, svgBounds }) => ({
            x: event.clientX - svgBounds.left,
            y: event.clientY - svgBounds.top
        }))
            .subscribe(({ x, y }) => {
            if (connectorFinder(shape).filter(link => link == line.elem).length > 0) {
                lineEndObservable(shape, line, x, y);
            }
        });
    }
}
function lineEndObservable(shape, line, x, y) {
    const svg = document.getElementById('diagrameditor');
    const mousemove = Observable.fromEvent(svg, 'mousemove');
    const mouseup = Observable.fromEvent(svg, 'mouseup');
    const shape2IsRectOrSquare = insideRectAndSquareChecker(shape, x, y);
    const shape2IsCircle = insideCircleChecker(shape, x, y);
    const shape2IsEllipse = insideEllipseChecker(shape, x, y);
    if (shape2IsRectOrSquare != undefined) {
        const shape2 = shape2IsRectOrSquare;
        const centerX = Number(shape2.getAttribute('x')) + Number(shape2.getAttribute('width')) / 2;
        const centerY = Number(shape2.getAttribute('y')) + Number(shape2.getAttribute('height')) / 2;
        line.attr('x2', centerX).attr('y2', centerY);
        Observable.fromEvent(shape2, 'mousedown')
            .map(({ clientX, clientY }) => ({
            xOffset: Number(shape2.getAttribute('x')) + Number(shape2.getAttribute('width')) / 2 - clientX,
            yOffset: Number(shape2.getAttribute('y')) + Number(shape2.getAttribute('height')) / 2 - clientY,
        }))
            .flatMap(({ xOffset, yOffset }) => mousemove
            .takeUntil(mouseup)
            .map(({ clientX, clientY }) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
        })))
            .subscribe(({ x, y }) => {
            line.attr('x2', x)
                .attr('y2', y);
        });
        linkList.push([shape.elem, shape2]);
    }
    else if (shape2IsCircle != undefined) {
        const shape2 = shape2IsCircle;
        line.attr('x2', shape2.getAttribute('cx')).attr('y2', shape2.getAttribute('cy'));
        Observable.fromEvent(shape2, 'mousedown')
            .map(({ clientX, clientY }) => ({
            xOffset: Number(shape2.getAttribute('cx')) - clientX,
            yOffset: Number(shape2.getAttribute('cy')) - clientY
        }))
            .flatMap(({ xOffset, yOffset }) => mousemove
            .takeUntil(mouseup)
            .map(({ clientX, clientY }) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
        })))
            .subscribe(({ x, y }) => {
            line.attr('x2', x)
                .attr('y2', y);
        });
        linkList.push([shape.elem, shape2]);
    }
    else if (shape2IsEllipse != undefined) {
        const shape2 = shape2IsEllipse;
        line.attr('x2', shape2.getAttribute('cx')).attr('y2', shape2.getAttribute('cy'));
        Observable.fromEvent(shape2, 'mousedown')
            .map(({ clientX, clientY }) => ({
            xOffset: Number(shape2.getAttribute('cx')) - clientX,
            yOffset: Number(shape2.getAttribute('cy')) - clientY
        }))
            .flatMap(({ xOffset, yOffset }) => mousemove
            .takeUntil(mouseup)
            .map(({ clientX, clientY }) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
        })))
            .subscribe(({ x, y }) => {
            line.attr('x2', x)
                .attr('y2', y);
        });
        linkList.push([shape.elem, shape2]);
    }
    else {
        svg.removeChild(line.elem);
    }
}
function deleteButton(shape, num) {
    const svg = document.getElementById('diagrameditor');
    const svg2 = document.getElementById('option');
    const bin = new Elem(svg2, 'rect')
        .attr('x', 150).attr('y', 15)
        .attr('fill', 'gray').attr('stroke', 'black')
        .attr('width', 100).attr('height', 100).attr('cursor', 'pointer');
    const text = new Elem(svg2, 'text')
        .attr('x', 165).attr('y', 70)
        .attr('fill', 'black').attr('cursor', 'pointer')
        .attr('font-weight', 'bold').attr('font-style', 'italic');
    text.elem.textContent = 'DELETE';
    bin.observe("click")
        .subscribe(() => {
        if (resizeAndCancelHandler) {
            let connector = connectorFinder(shape);
            if (connector.length != 0) {
                connector.forEach(item => svg.removeChild(item));
            }
            for (let i = 0, l = linkList.length; i < l; i++) {
                if (linkList[i][0] == shape.elem || linkList[i][1] == shape.elem) {
                    linkList[i] = [];
                }
            }
            svg.removeChild(shape.elem);
            svg.removeChild(num.elem);
            clearOption();
        }
    });
    bin.observe('mouseover')
        .subscribe(() => {
        if (resizeAndCancelHandler) {
            bin.attr('fill', 'yellow')
                .attr('stroke-dasharray', 5);
        }
        else {
            bin.attr('cursor', 'not-allowed');
        }
    });
    bin.observe('mouseout')
        .subscribe(() => {
        if (resizeAndCancelHandler) {
            bin.attr('fill', 'gray')
                .attr('stroke-dasharray', 0);
        }
        else {
            bin.attr('cursor', 'pointer');
        }
    });
    text.observe("click")
        .subscribe(() => {
        if (resizeAndCancelHandler) {
            let connector = connectorFinder(shape);
            if (connector.length != 0) {
                connector.forEach(item => svg.removeChild(item));
            }
            for (let i = 0, l = linkList.length; i < l; i++) {
                if (linkList[i][0] == shape.elem || linkList[i][1] == shape.elem) {
                    linkList[i] = [];
                }
            }
            svg.removeChild(shape.elem);
            svg.removeChild(num.elem);
            clearOption();
        }
    });
    text.observe('mouseover')
        .subscribe(() => {
        if (resizeAndCancelHandler) {
            bin.attr('fill', 'yellow')
                .attr('stroke-dasharray', 5.5);
        }
        else {
            text.attr('cursor', 'not-allowed');
        }
    });
    text.observe('mouseout')
        .subscribe(() => {
        if (resizeAndCancelHandler) {
            bin.attr('fill', 'gray')
                .attr('stroke-dasharray', 0);
        }
        else {
            text.attr('cursor', 'pointer');
        }
    });
}
function resizeButton(shape, shapelabel, num) {
    const svg = document.getElementById('diagrameditor');
    const svg2 = document.getElementById('option');
    const resize = new Elem(svg2, 'rect')
        .attr('x', 295).attr('y', 15)
        .attr('fill', 'gray').attr('stroke', 'black')
        .attr('width', 100).attr('height', 100).attr('cursor', 'pointer');
    const text = new Elem(svg2, 'text')
        .attr('x', 315).attr('y', 70)
        .attr('fill', 'black').attr('cursor', 'pointer')
        .attr('font-weight', 'bold').attr('font-style', 'italic');
    text.elem.textContent = 'RESIZE';
    resize.observe("click")
        .subscribe(() => {
        if (linkHandler) {
            svg2.removeChild(resize.elem);
            let cancel = cancelButton(shape, shapelabel, num);
            resizeObservable(shape, shapelabel, cancel, num);
        }
    });
    resize.observe('mouseover')
        .subscribe(() => {
        linkHandler = linkChecker(shape);
        if (linkHandler) {
            resize.attr('fill', 'yellow')
                .attr('stroke-dasharray', 5);
        }
        else {
            resize.attr('cursor', 'not-allowed');
        }
    });
    resize.observe('mouseout')
        .subscribe(() => {
        if (linkHandler) {
            resize.attr('fill', 'gray')
                .attr('stroke-dasharray', 0);
        }
        else {
            resize.attr('cursor', 'pointer');
        }
    });
    text.observe("click")
        .subscribe(() => {
        if (linkHandler) {
            svg2.removeChild(resize.elem);
            let cancel = cancelButton(shape, shapelabel, num);
            resizeObservable(shape, shapelabel, cancel, num);
        }
    });
    text.observe('mouseover')
        .subscribe(() => {
        linkHandler = linkChecker(shape);
        if (linkHandler) {
            resize.attr('fill', 'yellow')
                .attr('stroke-dasharray', 5.5);
        }
        else {
            text.attr('cursor', 'not-allowed');
        }
    });
    text.observe('mouseout')
        .subscribe(() => {
        if (linkHandler) {
            resize.attr('fill', 'gray')
                .attr('stroke-dasharray', 0);
        }
        else {
            text.attr('cursor', 'pointer');
        }
    });
}
function cancelButton(shape, shapelabel, num) {
    const svg = document.getElementById('diagrameditor');
    const svg2 = document.getElementById('option');
    const cancel = new Elem(svg2, 'rect')
        .attr('x', 295).attr('y', 15)
        .attr('fill', 'gray').attr('stroke', 'black')
        .attr('width', 100).attr('height', 100).attr('cursor', 'pointer');
    const text = new Elem(svg2, 'text')
        .attr('x', 312.5).attr('y', 70)
        .attr('fill', 'black').attr('cursor', 'pointer')
        .attr('font-weight', 'bold').attr('font-style', 'italic');
    text.elem.textContent = 'CANCEL';
    cancel.observe("click")
        .subscribe(() => {
        svg2.removeChild(cancel.elem);
        resizeButton(shape, shapelabel, num);
        if (resizeAndCancelList.length != 0) {
            removeFrame(resizeAndCancelList.pop());
            resizeAndCancelHandler = true;
            linkHandler = true;
        }
    });
    cancel.observe('mouseover')
        .subscribe(() => {
        cancel.attr('fill', 'yellow')
            .attr('stroke-dasharray', 5);
    });
    cancel.observe('mouseout')
        .subscribe(() => {
        cancel.attr('fill', 'gray')
            .attr('stroke-dasharray', 0);
    });
    text.observe("click")
        .subscribe(() => {
        svg2.removeChild(cancel.elem);
        resizeButton(shape, shapelabel, num);
        if (resizeAndCancelList.length != 0) {
            removeFrame(resizeAndCancelList.pop());
            resizeAndCancelHandler = true;
            linkHandler = true;
        }
    });
    text.observe('mouseover')
        .subscribe(() => {
        cancel.attr('fill', 'yellow')
            .attr('stroke-dasharray', 5.5);
    });
    text.observe('mouseout')
        .subscribe(() => {
        cancel.attr('fill', 'gray')
            .attr('stroke-dasharray', 0);
    });
    return [cancel, text];
}
function resizeObservable(shape, shapelabel, cancel, num) {
    const svg = document.getElementById('diagrameditor');
    if (shapelabel == 'rect' || shapelabel == 'square') {
        const topLeftX = Number(shape.attr('x'));
        const topLeftY = Number(shape.attr('y'));
        const topRightX = topLeftX + Number(shape.attr('width'));
        const bottomLeftY = topLeftY + Number(shape.attr('height'));
        const centerX = topLeftX + Number(shape.attr('width')) / 2;
        const centerY = topLeftY + Number(shape.attr('height')) / 2;
        const frame = resizeFrame(shape, shapelabel, topLeftX, topRightX, topLeftY, bottomLeftY, centerX, centerY);
        resizeAndCancelList.push(frame);
        resizeAndCancelHandler = false;
        resizeFrameObservable(frame, shape, shapelabel, num);
        removeFrameObservable(frame, cancel);
    }
    else if (shapelabel == 'circle') {
        const topLeftX = Number(shape.attr('cx')) - Number(shape.attr('r'));
        const topLeftY = Number(shape.attr('cy')) - Number(shape.attr('r'));
        const topRightX = topLeftX + Number(shape.attr('r')) * 2;
        const bottomLeftY = topLeftY + Number(shape.attr('r')) * 2;
        const centerX = Number(shape.attr('cx'));
        const centerY = Number(shape.attr('cy'));
        const frame = resizeFrame(shape, shapelabel, topLeftX, topRightX, topLeftY, bottomLeftY, centerX, centerY);
        resizeAndCancelList.push(frame);
        resizeAndCancelHandler = false;
        resizeFrameObservable(frame, shape, shapelabel, num);
        removeFrameObservable(frame, cancel);
    }
    else {
        const topLeftX = Number(shape.attr('cx')) - Number(shape.attr('rx'));
        const topLeftY = Number(shape.attr('cy')) - Number(shape.attr('ry'));
        const topRightX = topLeftX + Number(shape.attr('rx')) * 2;
        const bottomLeftY = topLeftY + Number(shape.attr('ry')) * 2;
        const centerX = Number(shape.attr('cx'));
        const centerY = Number(shape.attr('cy'));
        const frame = resizeFrame(shape, shapelabel, topLeftX, topRightX, topLeftY, bottomLeftY, centerX, centerY);
        resizeAndCancelList.push(frame);
        resizeAndCancelHandler = false;
        resizeFrameObservable(frame, shape, shapelabel, num);
        removeFrameObservable(frame, cancel);
    }
}
function resizeFrame(shape, shapelabel, x1, x2, y1, y2, a1, b1) {
    const svg = document.getElementById('diagrameditor');
    const line1 = new Elem(svg, 'line')
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x2).attr('y2', y1).attr('id', 'line')
        .attr('stroke', 'black').attr('stroke-width', 2).attr('stroke-dasharray', 10);
    const line2 = new Elem(svg, 'line')
        .attr('x1', x2).attr('y1', y1)
        .attr('x2', x2).attr('y2', y2).attr('id', 'line')
        .attr('stroke', 'black').attr('stroke-width', 2).attr('stroke-dasharray', 10);
    const line3 = new Elem(svg, 'line')
        .attr('x1', x1).attr('y1', y2)
        .attr('x2', x2).attr('y2', y2).attr('id', 'line')
        .attr('stroke', 'black').attr('stroke-width', 2).attr('stroke-dasharray', 10);
    const line4 = new Elem(svg, 'line')
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x1).attr('y2', y2).attr('id', 'line')
        .attr('stroke', 'black').attr('stroke-width', 2).attr('stroke-dasharray', 10);
    const dot1 = new Elem(svg, 'circle').attr('id', 'dot11')
        .attr('cx', x1).attr('cy', y1)
        .attr('r', 6).attr('fill', 'gray').attr('cursor', 'move');
    const dot2 = new Elem(svg, 'circle').attr('id', 'dot21')
        .attr('cx', x2).attr('cy', y1)
        .attr('r', 6).attr('fill', 'gray').attr('cursor', 'move');
    const dot3 = new Elem(svg, 'circle').attr('id', 'dot22')
        .attr('cx', x2).attr('cy', y2)
        .attr('r', 6).attr('fill', 'gray').attr('cursor', 'move');
    const dot4 = new Elem(svg, 'circle').attr('id', 'dot12')
        .attr('cx', x1).attr('cy', y2)
        .attr('r', 6).attr('fill', 'gray').attr('cursor', 'move');
    const dot5 = new Elem(svg, 'circle').attr('id', 'dot31')
        .attr('cx', a1).attr('cy', y1)
        .attr('r', 6).attr('fill', 'gray').attr('cursor', 'move');
    const dot6 = new Elem(svg, 'circle').attr('id', 'dot23')
        .attr('cx', x2).attr('cy', b1)
        .attr('r', 6).attr('fill', 'gray').attr('cursor', 'move');
    const dot7 = new Elem(svg, 'circle').attr('id', 'dot32')
        .attr('cx', a1).attr('cy', y2)
        .attr('r', 6).attr('fill', 'gray').attr('cursor', 'move');
    const dot8 = new Elem(svg, 'circle').attr('id', 'dot13')
        .attr('cx', x1).attr('cy', b1)
        .attr('r', 6).attr('fill', 'gray').attr('cursor', 'move');
    return [line1, line2, line3, line4, dot1, dot2, dot3, dot4, dot5, dot6, dot7, dot8];
}
function resizeFrameObservable(frameList, shape, shapelabel, num) {
    const svg = document.getElementById('diagrameditor');
    const mouseclick = Observable.fromEvent(svg, "click");
    const mousemove = Observable.fromEvent(svg, 'mousemove');
    const mouseup = Observable.fromEvent(svg, 'mouseup');
    const mousedown = Observable.fromEvent(svg, 'mousedown');
    for (let i = 4, l = 8; i < l; i++) {
        frameList[i].observe('mousedown')
            .map(({ clientX, clientY }) => ({
            xOffset: Number(frameList[i].attr('cx')) - clientX,
            yOffset: Number(frameList[i].attr('cy')) - clientY,
        }))
            .flatMap(({ xOffset, yOffset }) => mousemove
            .takeUntil(mouseup)
            .filter(({ clientX }) => clientX - svg.getBoundingClientRect().left >= 200)
            .map(({ clientX, clientY }) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
        })))
            .subscribe(({ x, y }) => {
            let id = frameList[i].attr('id');
            if (id.slice(-1) == '1') {
                frameList[4].attr('cy', y);
                frameList[5].attr('cy', y);
                frameList[8].attr('cy', y).attr('cx', (Number(frameList[4].attr('cx')) + Number(frameList[5].attr('cx'))) / 2);
                frameList[10].attr('cx', (Number(frameList[4].attr('cx')) + Number(frameList[5].attr('cx'))) / 2);
                if (id.slice(-2, -1) == '1') {
                    frameList[4].attr('cx', x);
                    frameList[7].attr('cx', x);
                    frameList[11].attr('cx', x);
                    frameList[0].attr('x1', x).attr('y1', y).attr('y2', y);
                    frameList[1].attr('y1', y);
                    frameList[2].attr('x1', x);
                    frameList[3].attr('x1', x).attr('y1', y).attr('x2', x);
                }
                else if (id.slice(-2, -1) == '2') {
                    frameList[5].attr('cx', x);
                    frameList[6].attr('cx', x);
                    frameList[9].attr('cx', x);
                    frameList[0].attr('x2', x).attr('y2', y).attr('y1', y);
                    frameList[1].attr('x1', x).attr('y1', y).attr('x2', x);
                    frameList[2].attr('x2', x);
                    frameList[3].attr('y1', y);
                }
                frameList[11].attr('cy', (Number(frameList[4].attr('cy')) + Number(frameList[7].attr('cy'))) / 2);
                frameList[9].attr('cy', (Number(frameList[4].attr('cy')) + Number(frameList[7].attr('cy'))) / 2);
            }
            else if (id.slice(-1) == '2') {
                frameList[6].attr('cy', y);
                frameList[7].attr('cy', y);
                frameList[10].attr('cy', y).attr('cx', (Number(frameList[6].attr('cx')) + Number(frameList[7].attr('cx'))) / 2);
                frameList[8].attr('cx', (Number(frameList[6].attr('cx')) + Number(frameList[7].attr('cx'))) / 2);
                if (id.slice(-2, -1) == '1') {
                    frameList[4].attr('cx', x);
                    frameList[7].attr('cx', x);
                    frameList[11].attr('cx', x);
                    frameList[0].attr('x1', x);
                    frameList[1].attr('y2', y);
                    frameList[2].attr('x1', x).attr('y1', y).attr('y2', y);
                    frameList[3].attr('x2', x).attr('y2', y).attr('x1', x);
                }
                else if (id.slice(-2, -1) == '2') {
                    frameList[5].attr('cx', x);
                    frameList[6].attr('cx', x);
                    frameList[9].attr('cx', x);
                    frameList[0].attr('x2', x);
                    frameList[1].attr('x1', x).attr('y2', y).attr('x2', x);
                    frameList[2].attr('x2', x).attr('y2', y).attr('y1', y);
                    frameList[3].attr('y2', y);
                }
                frameList[11].attr('cy', (Number(frameList[4].attr('cy')) + Number(frameList[7].attr('cy'))) / 2);
                frameList[9].attr('cy', (Number(frameList[4].attr('cy')) + Number(frameList[7].attr('cy'))) / 2);
            }
            let shapeX = Math.min(Number(frameList[4].attr('cx')), Number(frameList[5].attr('cx')), Number(frameList[6].attr('cx')), Number(frameList[7].attr('cx')));
            let shapeY = Math.min(Number(frameList[4].attr('cy')), Number(frameList[5].attr('cy')), Number(frameList[6].attr('cy')), Number(frameList[7].attr('cy')));
            if (shapelabel == 'rect' || shapelabel == 'square') {
                shape.attr('x', shapeX).attr('y', shapeY)
                    .attr('width', Math.abs(Number(frameList[5].attr('cx')) - Number(frameList[4].attr('cx'))))
                    .attr('height', Math.abs(Number(frameList[7].attr('cy')) - Number(frameList[4].attr('cy'))));
                num.attr('x', shapeX).attr('y', shapeY);
            }
            else if (shapelabel == 'circle') {
                shape.attr('cx', frameList[8].attr('cx')).attr('cy', frameList[9].attr('cy'))
                    .attr('r', Math.abs(Number(frameList[8].attr('cx')) - Number(frameList[9].attr('cx'))));
                num.attr('x', shapeX).attr('y', shapeY);
            }
            else {
                shape.attr('cx', frameList[8].attr('cx')).attr('cy', frameList[9].attr('cy'))
                    .attr('rx', Math.abs(Number(frameList[8].attr('cx')) - Number(frameList[9].attr('cx'))))
                    .attr('ry', Math.abs(Number(frameList[8].attr('cy')) - Number(frameList[9].attr('cy'))));
                num.attr('x', shapeX).attr('y', shapeY);
            }
        });
    }
    for (let i = 8, l = 12; i < l; i++) {
        frameList[i].observe('mousedown')
            .map(({ clientX, clientY }) => ({
            xOffset: Number(frameList[i].attr('cx')) - clientX,
            yOffset: Number(frameList[i].attr('cy')) - clientY
        }))
            .flatMap(({ xOffset, yOffset }) => mousemove
            .takeUntil(mouseup)
            .filter(({ clientX }) => clientX - svg.getBoundingClientRect().left >= 200)
            .map(({ clientX, clientY }) => ({
            x: clientX + xOffset,
            y: clientY + yOffset,
        })))
            .subscribe(({ x, y }) => {
            let id = frameList[i].attr('id');
            if (id.slice(-2) == '31') {
                frameList[4].attr('cy', y);
                frameList[5].attr('cy', y);
                frameList[8].attr('cy', y);
                frameList[0].attr('y1', y).attr('y2', y);
                frameList[1].attr('y1', y);
                frameList[3].attr('y1', y);
                frameList[11].attr('cy', (Number(frameList[4].attr('cy')) + Number(frameList[7].attr('cy'))) / 2);
                frameList[9].attr('cy', (Number(frameList[4].attr('cy')) + Number(frameList[7].attr('cy'))) / 2);
            }
            else if (id.slice(-2) == '13') {
                frameList[4].attr('cx', x);
                frameList[7].attr('cx', x);
                frameList[11].attr('cx', x);
                frameList[0].attr('x1', x);
                frameList[2].attr('x1', x);
                frameList[3].attr('x1', x).attr('x2', x);
                frameList[10].attr('cx', (Number(frameList[6].attr('cx')) + Number(frameList[7].attr('cx'))) / 2);
                frameList[8].attr('cx', (Number(frameList[6].attr('cx')) + Number(frameList[7].attr('cx'))) / 2);
            }
            else if (id.slice(-2) == '32') {
                frameList[6].attr('cy', y);
                frameList[7].attr('cy', y);
                frameList[10].attr('cy', y);
                frameList[1].attr('y2', y);
                frameList[2].attr('y1', y).attr('y2', y);
                frameList[3].attr('y2', y);
                frameList[11].attr('cy', (Number(frameList[4].attr('cy')) + Number(frameList[7].attr('cy'))) / 2);
                frameList[9].attr('cy', (Number(frameList[4].attr('cy')) + Number(frameList[7].attr('cy'))) / 2);
            }
            else if (id.slice(-2) == '23') {
                frameList[5].attr('cx', x);
                frameList[6].attr('cx', x);
                frameList[9].attr('cx', x);
                frameList[0].attr('x2', x);
                frameList[1].attr('x1', x).attr('x2', x);
                frameList[2].attr('x2', x);
                frameList[10].attr('cx', (Number(frameList[6].attr('cx')) + Number(frameList[7].attr('cx'))) / 2);
                frameList[8].attr('cx', (Number(frameList[6].attr('cx')) + Number(frameList[7].attr('cx'))) / 2);
            }
            let shapeX = Math.min(Number(frameList[4].attr('cx')), Number(frameList[5].attr('cx')), Number(frameList[6].attr('cx')), Number(frameList[7].attr('cx')));
            let shapeY = Math.min(Number(frameList[4].attr('cy')), Number(frameList[5].attr('cy')), Number(frameList[6].attr('cy')), Number(frameList[7].attr('cy')));
            if (shapelabel == 'rect' || shapelabel == 'square') {
                shape.attr('x', shapeX).attr('y', shapeY)
                    .attr('width', Math.abs(Number(frameList[5].attr('cx')) - Number(frameList[4].attr('cx'))))
                    .attr('height', Math.abs(Number(frameList[7].attr('cy')) - Number(frameList[4].attr('cy'))));
                num.attr('x', shapeX).attr('y', shapeY);
            }
            else if (shapelabel == 'circle') {
                shape.attr('cx', frameList[8].attr('cx')).attr('cy', frameList[9].attr('cy'))
                    .attr('r', Math.abs(Number(frameList[8].attr('cx')) - Number(frameList[9].attr('cx'))));
                num.attr('x', shapeX).attr('y', shapeY);
            }
            else {
                shape.attr('cx', frameList[8].attr('cx')).attr('cy', frameList[9].attr('cy'))
                    .attr('rx', Math.abs(Number(frameList[8].attr('cx')) - Number(frameList[9].attr('cx'))))
                    .attr('ry', Math.abs(Number(frameList[8].attr('cy')) - Number(frameList[9].attr('cy'))));
                num.attr('x', shapeX).attr('y', shapeY);
            }
        });
    }
}
function removeFrame(frameList) {
    const svg = document.getElementById('diagrameditor');
    for (let i = 0, l = frameList.length; i < l; i++) {
        svg.removeChild(frameList[i].elem);
    }
}
function removeFrameObservable(frameList, cancel) {
    const svg = document.getElementById('diagrameditor');
    cancel[0].observe("click")
        .subscribe(() => {
        removeFrame(frameList);
    });
    cancel[1].observe("click")
        .subscribe(() => {
        removeFrame(frameList);
    });
}
function dragShapeObservable(shape, shapelabel, num) {
    const svg = document.getElementById("diagrameditor");
    const { left, top } = svg.getBoundingClientRect();
    const mousemove = Observable.fromEvent(svg, 'mousemove');
    const mouseup = Observable.fromEvent(svg, 'mouseup');
    if (shapelabel == 'rect' || shapelabel == 'square') {
        shape.observe('mousedown')
            .map(({ clientX, clientY }) => ({
            xOffset: Number(shape.attr('x')) - clientX,
            yOffset: Number(shape.attr('y')) - clientY
        }))
            .flatMap(({ xOffset, yOffset }) => mousemove
            .takeUntil(mouseup)
            .map(({ clientX, clientY }) => ({
            x: clientX + xOffset,
            y: clientY + yOffset,
        })))
            .subscribe(({ x, y }) => {
            shape.attr('x', x)
                .attr('y', y);
            num.attr('x', x)
                .attr('y', y);
            currentShapeNum = Number(num.elem.textContent);
            if (resizeAndCancelList.length != 0) {
                removeFrame(resizeAndCancelList.pop());
                resizeAndCancelHandler = true;
                linkHandler = true;
            }
            draggedShapeAnimation(shape, shapelabel, num);
        });
        showOptionObservable(shape, shapelabel, num);
    }
    else {
        shape.observe('mousedown')
            .map(({ clientX, clientY }) => ({
            xOffset: Number(shape.attr('cx')) - clientX,
            yOffset: Number(shape.attr('cy')) - clientY
        }))
            .flatMap(({ xOffset, yOffset }) => mousemove
            .takeUntil(mouseup)
            .map(({ clientX, clientY }) => ({
            x: clientX + xOffset,
            y: clientY + yOffset
        })))
            .subscribe(({ x, y }) => {
            shape.attr('cx', x)
                .attr('cy', y);
            num.attr('x', x - Number(shape.attr('r')))
                .attr('y', y - Number(shape.attr('r')));
            currentShapeNum = Number(num.elem.textContent);
            if (resizeAndCancelList.length != 0) {
                removeFrame(resizeAndCancelList.pop());
                resizeAndCancelHandler = true;
                linkHandler = true;
            }
            draggedShapeAnimation(shape, shapelabel, num);
        });
        showOptionObservable(shape, shapelabel, num);
    }
}
function createShape(shapelabel, num) {
    const svg = document.getElementById('diagrameditor');
    if (shapelabel == 'rect') {
        const rect = new Elem(svg, 'rect')
            .attr('x', 30).attr('y', 50)
            .attr('width', 120).attr('height', 80)
            .attr('fill', 'red').attr('cursor', 'move')
            .attr('id', 'rect');
        const text = new Elem(svg, 'text')
            .attr('x', 30).attr('y', 50).attr('fill', 'black')
            .attr('font-weight', 'bold').attr('font-style', 'italic');
        text.elem.textContent = String(num);
        dragShapeObservable(rect, 'rect', text);
        const clickAndCreate = rect.observe('mousedown')
            .takeUntil(rect.observe("click"))
            .subscribe(() => {
            let handle = setInterval(() => {
                if (Number(rect.attr('x')) < 200) {
                    svg.removeChild(rect.elem);
                    svg.removeChild(text.elem);
                    clearOption();
                    clearInterval(handle);
                }
            }, 3000);
            createShape(shapelabel, num + 1);
        });
        checkBoundary(rect, shapelabel, text);
    }
    else if (shapelabel == 'square') {
        const square = new Elem(svg, 'rect')
            .attr('x', 40).attr('y', 150)
            .attr('rx', 30).attr('ry', 30)
            .attr('width', 100).attr('height', 100)
            .attr('fill', 'green').attr('cursor', 'move')
            .attr('id', 'square');
        const text = new Elem(svg, 'text')
            .attr('x', 40).attr('y', 150).attr('fill', 'black')
            .attr('font-weight', 'bold').attr('font-style', 'italic');
        text.elem.textContent = String(num);
        dragShapeObservable(square, 'square', text);
        const clickAndCreate = square.observe('mousedown')
            .takeUntil(square.observe("click"))
            .subscribe(() => {
            let handle = setInterval(() => {
                if (Number(square.attr('x')) < 200) {
                    svg.removeChild(square.elem);
                    svg.removeChild(text.elem);
                    clearOption();
                    clearInterval(handle);
                }
            }, 3000);
            createShape(shapelabel, num + 1);
        });
        checkBoundary(square, shapelabel, text);
    }
    else if (shapelabel == 'circle') {
        const circle = new Elem(svg, 'circle')
            .attr('cx', 90).attr('cy', 320).attr('r', 50)
            .attr('fill', 'blue').attr('cursor', 'move')
            .attr('id', 'circle');
        const text = new Elem(svg, 'text')
            .attr('x', 40).attr('y', 270).attr('fill', 'black')
            .attr('font-weight', 'bold').attr('font-style', 'italic');
        text.elem.textContent = String(num);
        dragShapeObservable(circle, 'circle', text);
        const clickAndCreate = circle.observe('mousedown')
            .takeUntil(circle.observe("click"))
            .subscribe(() => {
            let handle = setInterval(() => {
                if (Number(circle.attr('cx')) - Number(circle.attr('r')) < 200) {
                    svg.removeChild(circle.elem);
                    svg.removeChild(text.elem);
                    clearOption();
                    clearInterval(handle);
                }
            }, 3000);
            createShape(shapelabel, num + 1);
        });
        checkBoundary(circle, shapelabel, text);
    }
    else {
        const ellipse = new Elem(svg, 'ellipse')
            .attr('cx', 90).attr('cy', 440)
            .attr('rx', 70).attr('ry', 50).attr('r', 50)
            .attr('fill', 'orange').attr('cursor', 'move')
            .attr('id', 'ellipse');
        const text = new Elem(svg, 'text')
            .attr('x', 40).attr('y', 390).attr('fill', 'black')
            .attr('font-weight', 'bold').attr('font-style', 'italic');
        text.elem.textContent = String(num);
        dragShapeObservable(ellipse, 'ellipse', text);
        const clickAndCreate = ellipse.observe('mousedown')
            .takeUntil(ellipse.observe("click"))
            .subscribe(() => {
            let handle = setInterval(() => {
                if (Number(ellipse.attr('cx')) - Number(ellipse.attr('rx')) < 200) {
                    svg.removeChild(ellipse.elem);
                    svg.removeChild(text.elem);
                    clearOption();
                    clearInterval(handle);
                }
            }, 3000);
            createShape(shapelabel, num + 1);
        });
        checkBoundary(ellipse, shapelabel, text);
    }
}
function createBoundary() {
    const svg = document.getElementById('diagrameditor');
    const svgBounds = svg.getBoundingClientRect();
    const boundary = new Elem(svg, 'line')
        .attr('x1', 200)
        .attr('y1', svgBounds.top + 550)
        .attr('x2', 200)
        .attr('y2', 0)
        .attr('stroke', 'black')
        .attr('stroke-width', 3);
}
function checkBoundary(shape, shapelabel, num) {
    const svg = document.getElementById('diagrameditor');
    if (shapelabel == 'rect' || shapelabel == 'square') {
        const shapeGuard = shape.observe("click")
            .filter(() => Number(shape.attr('x')) < 200)
            .subscribe(_ => {
            let connector = connectorFinder(shape);
            if (connector != []) {
                connector.forEach(item => svg.removeChild(item));
            }
            for (let i = 0, l = linkList.length; i < l; i++) {
                if (linkList[i][0] == shape.elem || linkList[i][1] == shape.elem) {
                    linkList[i] = [];
                }
            }
            svg.removeChild(shape.elem);
            svg.removeChild(num.elem);
            clearOption();
        });
    }
    else if (shapelabel == 'circle') {
        const shapeGuard = shape.observe("click")
            .filter(() => (Number(shape.attr('cx')) - Number(shape.attr('r'))) < 200)
            .subscribe(_ => {
            let connector = connectorFinder(shape);
            if (connector != []) {
                connector.forEach(item => svg.removeChild(item));
            }
            for (let i = 0, l = linkList.length; i < l; i++) {
                if (linkList[i][0] == shape.elem || linkList[i][1] == shape.elem) {
                    linkList[i] = [];
                }
            }
            svg.removeChild(shape.elem);
            svg.removeChild(num.elem);
            clearOption();
        });
    }
    else {
        const shapeGuard = shape.observe("click")
            .filter(() => (Number(shape.attr('cx')) - Number(shape.attr('rx'))) < 200)
            .subscribe(_ => {
            let connector = connectorFinder(shape);
            if (connector != []) {
                connector.forEach(item => svg.removeChild(item));
            }
            for (let i = 0, l = linkList.length; i < l; i++) {
                if (linkList[i][0] == shape.elem || linkList[i][1] == shape.elem) {
                    linkList[i] = [];
                }
            }
            svg.removeChild(shape.elem);
            svg.removeChild(num.elem);
            clearOption();
        });
    }
}
function draggedShapeAnimation(shape, shapelabel, num) {
    let colorList = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    let count = 0;
    let blinkColor = setInterval(() => {
        if (Number(num.elem.textContent) == currentShapeNum) {
            shape.attr('fill', String(colorList[count % colorList.length]));
            count += 1;
        }
        else {
            if (shapelabel == 'rect') {
                shape.attr('fill', 'red');
            }
            else if (shapelabel == 'square') {
                shape.attr('fill', 'green');
            }
            else if (shapelabel == 'circle') {
                shape.attr('fill', 'blue');
            }
            else {
                shape.attr('fill', 'orange');
            }
            clearInterval(blinkColor);
        }
    }, 500);
}
if (typeof window != 'undefined')
    window.onload = () => {
        createBoundary();
        createShape('rect', 1001);
        createShape('square', 2001);
        createShape('circle', 3001);
        createShape('ellipse', 4001);
    };
//# sourceMappingURL=diagrameditor.js.map