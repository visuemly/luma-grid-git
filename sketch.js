let libs = ['https://cdn.jsdelivr.net/npm/p5.capture@1.6'] //////////// Library zum Video Aufnhemen


let guiHolder
let input

let mySelect, drawMode
let opts = ['rect', 'circle']

let spacingSlider
let shapeSizeSlider
let strokeWeightSlider

let vid
let colorPicker
let colorPicker2

let currentSource

let captureBtn
let recording = false

P5Capture.setDefaultOptions({
	disableUi: true
})

let offsetX, offsetY
let dragging = false
let guiVisible = true

let aboutPopup
let aboutCloseBtn

let aboutOverlay
let webcam
let aboutVisible = true;


function setup() {
	createCanvas(windowWidth, windowHeight)
	pixelDensity(1)
    frameRate(30)
	
aboutOverlay = createDiv()
aboutOverlay.class('aboutOverlay')
	
	
// ABOUT POPUP/////////////////////////////////////////


aboutPopup = createDiv(`
<h2>LUMA GRID</h2>

<p>
Interactive video rasterizer.<br><br>

Upload your own video or switch to webcam input.
Adjust spacing, size and stroke parameters
to generate different visual structures.<br><br>

Press <b>G</b> to hide the interface.<br>
Press <b>A</b> to see the about.<br>
:D

</p>
`)

aboutPopup.class('aboutPopup')

aboutCloseBtn = createButton('Start')
aboutCloseBtn.parent(aboutPopup)
aboutCloseBtn.class('aboutBtn')

aboutCloseBtn.mousePressed(() => {
    aboutPopup.hide();
    aboutOverlay.hide();
    aboutVisible = false;
});
	


	
	// GUI CONTAINER/////////////////////////////////////////
	

	guiHolder = createDiv()
		.class('guiHolder')

guiHolder.mousePressed((e) => {

	// Wenn Klick auf UI Element = KEIN Drag
	if(e.target.tagName === 'INPUT' ||
	   e.target.tagName === 'SELECT' ||
	   e.target.tagName === 'BUTTON'){
		return
	}

	dragging = true

	offsetX = mouseX - guiHolder.position().x
	offsetY = mouseY - guiHolder.position().y
})

	createDiv('LUMA GRID')
		.parent(guiHolder)
		.class('label')

	//FILE INPUT/////////////////////////////////////////
	

	input = createFileInput(fileHandle)
	input.style('display', 'none')

	createDiv('UPLOAD VIDEO')
		.parent(guiHolder)
		.class('sliderName')

	let btn = createButton('CUSTOM FILE')
		.parent(guiHolder)
		.class('guiButton')

	btn.mousePressed(() => input.elt.click())

	
	// WEBCAM/////////////////////////////////////////
	

	webcam = createCapture({
		video: { width: 1280, height: 720 },
		audio: false
	})

	webcam.hide()

	let webcamActive = false

	createDiv('source')
		.parent(guiHolder)
		.class('sliderName')

	let webcamBtn = createButton('WEBCAM')
		.parent(guiHolder)
		.class('guiButton')

	webcamBtn.mousePressed(() => {

		webcamActive = !webcamActive

		if(webcamActive){
			vid.pause()
			currentSource = webcam
			webcamBtn.html('VIDEO')
		} else {
			vid.loop()
			currentSource = vid
			webcamBtn.html('WEBCAM')
		}
	})

	
	// VIDEO/////////////////////////////////////////
	

vid = createVideo(["./data/videos/Vogel.mp4"])

vid.volume(0)

vid.elt.muted = true
vid.elt.playsInline = true

vid.loop()
vid.hide()

currentSource = vid

	// DROPDOWN/////////////////////////////////////////
	

createDiv('shape mode')
	.parent(guiHolder)
	.class('sliderName')

let toggleWrap = createDiv()
	.parent(guiHolder)
	.class('toggleWrap')

let toggleBtn = createButton('CIRCLE')
	.parent(toggleWrap)
	.class('toggleBtn')

drawMode = 'circle'

toggleBtn.mousePressed(() => {

	if(drawMode === 'circle'){

		drawMode = 'rect'
		toggleBtn.html('RECT')

	}else{

		drawMode = 'circle'
		toggleBtn.html('CIRCLE')
	}
})


	
	// SLIDERS/////////////////////////////////////////
	

	createDiv('spacing')
		.parent(guiHolder)
		.class('sliderName')

	spacingSlider = createSlider(8, 255, 10, 1)
		.parent(guiHolder)
		.class('slider')

	createDiv('size')
		.parent(guiHolder)
		.class('sliderName')

	shapeSizeSlider = createSlider(3, 100, 3, 1)
		.parent(guiHolder)
		.class('slider')

	createDiv('stroke weight')
		.parent(guiHolder)
		.class('sliderName')

	strokeWeightSlider = createSlider(0, 100, 0, 1)
		.parent(guiHolder)
		.class('slider')

	
	// COLORS/////////////////////////////////////////
	

	createDiv('colors')
		.parent(guiHolder)
		.class('sliderName')

	let colorWrap = createDiv()
		.parent(guiHolder)
		.class('colorWrap')

	let bgWrap = createDiv()
		.parent(colorWrap)
		.class('pickerWrap')

	createDiv('background')
		.parent(bgWrap)
		.class('pickerLabel')

	colorPicker = createColorPicker('#000000')
		.parent(bgWrap)
		.class('picker')

	let strokeWrap = createDiv()
		.parent(colorWrap)
		.class('pickerWrap')

	createDiv('stroke')
		.parent(strokeWrap)
		.class('pickerLabel')

	colorPicker2 = createColorPicker('#ffffff')
		.parent(strokeWrap)
		.class('picker')

	
	// RECORDING/////////////////////////////////////////
	

	createDiv('record')
		.parent(guiHolder)
		.class('sliderName')

	captureBtn = createButton('START RECORDING')
		.parent(guiHolder)
		.class('guiButton')

captureBtn.mousePressed(() => {

    if(!recording){

        P5Capture.getInstance().start({
            format:'webm'
        })

        recording = true
        captureBtn.html("STOP RECORDING")

    }else{

        P5Capture.getInstance().stop()

        recording = false
        captureBtn.html("START RECORDING")

        console.log("STOP")
    }
})


}


function draw(){

	background(colorPicker.color())

	currentSource.loadPixels()
	if(currentSource.pixels.length === 0) return

	stroke(colorPicker2.color())
	strokeWeight(strokeWeightSlider.value())

	let spacing = spacingSlider.value()
	let sizeFactor = shapeSizeSlider.value()

	push()

	scale(width/currentSource.width, height/currentSource.height)
    rectMode(CENTER)

	for(let y=0;y<currentSource.height;y+=spacing){
		for(let x=0;x<currentSource.width;x+=spacing){

			let i=(y*currentSource.width+x)*4

			let r=currentSource.pixels[i]
			let g=currentSource.pixels[i+1]
			let b=currentSource.pixels[i+2]

		
			const brightness = (r + g + b) / 0.8 / 360

			const radius =
				spacing *
				(1 - brightness) *
				sizeFactor

			fill(r,g,b)

			if(drawMode=='circle'){
				ellipse(x,y,radius,radius)
			}else{
				rect(x,y,radius,radius)
			}
		}
	}

	pop()
}


function fileHandle(file){
	if(file.type==='video'){
		if(vid) vid.remove()
		vid=createVideo([file.data])
		vid.hide()
		vid.loop()
		currentSource=vid
	}
}






function keyPressed(){

	if(key==='g' || key==='G'){

		guiVisible = !guiVisible

		if(guiVisible){

			guiHolder.style('display', 'flex')
			guiHolder.style('opacity', '1')
			guiHolder.style('pointer-events', 'auto')

		} else {

			guiHolder.style('opacity', '0')
			guiHolder.style('pointer-events', 'none')

		}
	}


    if(key === 'a' || key === 'A'){

    aboutVisible = !aboutVisible;

    if(aboutVisible){
        aboutPopup.show();
        aboutOverlay.show();
    } else {
        aboutPopup.hide();
        aboutOverlay.hide();
    }
}
}
function mouseDragged(){

	if(!dragging) return

	// verhindert Slider-Movement Konflikte
	if(mouseX < 0 || mouseY < 0) return

	guiHolder.position(
		mouseX - offsetX,
		mouseY - offsetY
	)
}

function mouseReleased(){
	dragging = false
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight)
}

