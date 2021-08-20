const btnCheck = document.querySelector('#btnCheck')
const txtName = document.querySelector("#txtName")
const txtUsername = document.querySelector("#txtUsername")
const txtDescription = document.querySelector("#txtDescription")
const txtEmpresa = document.querySelector("#txtEmpresa")
const txtDate = document.querySelector("#txtDate")
const imgThumb = document.querySelector("#imgThumb")
const txtHour = document.querySelector("#txtHour")
const informacion = document.querySelector("#informacion")

btnCheck.disabled = true
btnCheck.value = "Cargando..."
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(start)


async function start() {
  const speech = new SpeechSynthesisUtterance();
  speech.lang = "es-MX";
  speech.volume = 1;
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let canvas

  btnCheck.addEventListener('click', async () => {
    informacion.innerHTML = "Informacion"
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
      txtEmpresa.innerHTML = "VAS Consulting"
      txtDate.innerHTML = new Date().toLocaleDateString()
      txtHour.innerHTML = await getHour()
      
      window.speechSynthesis.speak(speech)
    } else {
      speech.text = "Acceso denegado"
      imgThumb.src = "https://bulma.io/images/placeholders/96x96.png"
      txtName.innerHTML = "Desconocido"
      txtUsername.innerHTML = "@desconocido"
      txtDescription.innerHTML = "Acceso denegado"
      txtEmpresa.innerHTML = ""
      txtDate.innerHTML = ""
      window.speechSynthesis.speak(speech)
    }
  })
  btnCheck.disabled = false
  btnCheck.value = "Check"

}

async function loadLabeledImages() {
  const labels = ['Aditazar Ponce', 'Black Widow', 'Captain America', 'Captain Marvel', 'Chris Cornell', 'Elizabeth', 'Fazur', 'Hawkeye', 'Jim Rhodes', 'Maria del Carmen Suarez Trejo', 'Rector', 'Serj Tankian', 'Synyster Gates', 'Thor', 'Tobias Forge', 'Tony Stark', 'Wes Borland']
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

console.log(getHour())

async function getHour() {
  let hora = new Date().getHours()
  let minutos = new Date().getMinutes() < 10 ? "0"+minutos : new Date().getMinutes()

  let horaActual = hora + ":" + minutos
  return horaActual
}