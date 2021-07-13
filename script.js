const btnCheck = document.querySelector('#btnCheck')
const txtName = document.querySelector("#txtName")
const txtUsername = document.querySelector("#txtUsername")
const txtDescription = document.querySelector("#txtDescription")
const txtDate = document.querySelector("#txtDate")
const imgThumb = document.querySelector("#imgThumb")


Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/logface/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/logface/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/logface/models')
]).then(start)


async function start() {
  const speech = new SpeechSynthesisUtterance();
  speech.lang = "es-MX";
  speech.volume = 1;
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let canvas
  alert("Listo")
  btnCheck.addEventListener('click', async () => {
    canvas = faceapi.createCanvasFromMedia(document.querySelector("#video"))
    const detections = await faceapi.detectAllFaces(canvas).withFaceLandmarks().withFaceDescriptors()
    const displaySize = { width: canvas.width, height: canvas.height }
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    if (results[0].label != "unknown") {
      speech.text = "Acceso permitido, bienvenido, " + results[0].label
      imgThumb.src = `labeled_images/${results[0].label}/1.jpg`
      txtName.innerHTML = results[0].label
      txtUsername.innerHTML = "@" + results[0].label
      txtDescription.innerHTML = "Empleado de sistemas"
      txtDate.innerHTML = new Date()
      window.speechSynthesis.speak(speech)
    } else {
      speech.text = "Acceso denegado"
      imgThumb.src = "https://bulma.io/images/placeholders/96x96.png"
      txtName.innerHTML = "Desconocido"
      txtUsername.innerHTML = "@desconocido"
      txtDescription.innerHTML = "Acceso denegado"
      txtDate.innerHTML = ""
      window.speechSynthesis.speak(speech)
    }
  })

}

async function loadLabeledImages() {
  const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Fazur', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
