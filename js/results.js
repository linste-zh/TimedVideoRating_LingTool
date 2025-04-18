let timeValues, ratingValues
const experimentData = JSON.parse(localStorage.getItem("experimentDataObject"))
const scale = JSON.parse(localStorage.getItem("scaleObject"))
var videoShown = false
var videoPicked = false

function setUp(){
    document.getElementsByTagName("body")[0].style = localStorage.getItem("theme")

    inputs = experimentData["dataInputs"]
    timeValues = []
    ratingValues = []

    for (var i in inputs){
        timeValues.push(inputs[i].time)
        ratingValues.push(inputs[i].rating)
    }

    document.getElementById("videoContainer").style.display = "none"


    showGraph()
    createCSV()
    createJpeg()
}

function showGraph(){

    var middle_rating = scale[Math.floor(Object.values(scale).length / 2)]
    console.log(middle_rating)

    if(Object.values(scale).length % 2 != 0){
        middle = middle_rating["value"];
    }else{
        middle = middle_rating["value"] - 0.5;
    }

    console.log(middle)

    //largely done via ChatGPT
    new Chart("resultChart", {
        type: "line",
        data: {
          labels: timeValues,
          datasets: [{
            label: experimentData["userName"] + " rating " + experimentData["lingVar"],
            borderColor: "rgba(0, 0, 0, 0.47)",
            data: ratingValues,
            fill: true,
        }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        min: scale[0]["value"],
                        max: scale[Object.values(scale).length - 1]["value"],
                        stepSize: 1,
                    },
                    gridLines: {
                        drawBorder: false
                    }
                }]
            },
            onClick: function(event, elements) {
                if (elements.length > 0) {
                    const firstPoint = elements[0];
                    const time = this.data.labels[firstPoint._index];
                    playVideo(time);
                }
            },
            annotation: {
                annotations: [{
                    type: "line",
                    mode: "horizontal",
                    scaleID: "y-axis-0",
                    value: middle,
                    borderWidth: 2,
                }]
            }
        },
        plugins: {
            beforeDraw: (chart) => {
                let ctx = chart.canvas.getContext("2d");
                ctx.fillStyle = "white"; // Set white background
                ctx.fillRect(0, 0, chart.width, chart.height);
            }
        }
    });
}

function playVideo(time){
    if(videoShown){
        document.getElementById("video_player").play()
        document.getElementById("video_player").currentTime = time;
    }
}

//source: https://medium.com/@idorenyinudoh10/how-to-export-data-from-javascript-to-a-csv-file-955bdfc394a9
function createCSV(){
    inputs = experimentData["dataInputs"]

    //create headers
    const titleKeys = Object.keys(inputs[0])

    //add headers to dataset
    const refinedData = []
    refinedData.push(titleKeys)

    //add data to dataset
    inputs.forEach(dp => {
        refinedData.push(Object.values(dp))  
    })

    let csvContent = ''

    //turn dataset into CSV format
    refinedData.forEach(row => {
        csvContent += row.join(',') + '\n'
    })

    csvLink = document.getElementById("csvLink")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
    csvURL =  URL.createObjectURL(blob)
    csvLink.setAttribute('href', csvURL)

    currentDate = new Date()
    const fileName = `${currentDate.getYear()}/${currentDate.getMonth()+1}/${currentDate.getDate()}_${experimentData["userName"]}_${experimentData["lingVar"]}`
    console.log(fileName)
    csvLink.setAttribute('download', fileName)
}

function createJpeg(){
    var canvas = document.getElementById("resultChart");
    setTimeout(() => {
        var canvasUrl = canvas.toDataURL("image/jpeg");

        jpegLink = document.getElementById("jpegLink")
        jpegLink.setAttribute('href', canvasUrl)

        currentDate = new Date()
        const fileName = `${currentDate.getYear()}/${currentDate.getMonth()+1}/${currentDate.getDate()}_${experimentData["userName"]}_${experimentData["lingVar"]}`
        console.log("ready to download")
        jpegLink.setAttribute('download', fileName)
    }, 500)
}

function toggleVideo(){
    document.getElementById("videoArrow").classList.toggle("active")
    videoContainer = document.getElementById("videoContainer")


    if(videoContainer.style.display == "none"){
        document.getElementById("showVideoText").innerHTML = "Hide Video"
        videoContainer.style.display = "flex"
        document.getElementById("resultsGrid").style.gridTemplateColumns = "1.5fr 1fr"
        videoShown = true
    }else{
        document.getElementById("showVideoText").innerHTML = "Show Video"
        if(videoPicked){document.getElementById("video_player").pause()}
        videoContainer.style.display = "none"
        document.getElementById("resultsGrid").style.gridTemplateColumns = "1fr auto"
        videoShown = false
    }
    showGraph()
}


async function setUpVideo(){
    const videoSrc = await pickSrc()

    videoContainer.innerHTML = '<video controls id="video_player" class="videoPlayer"><source id = "video_src" type="video/mp4"></video>'
    document.getElementById("video_player")
    document.getElementById("video_player").src = videoSrc
}

function pickSrc(){
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = "video/mp4"
        input.style = "display: none;"
        input.onchange = () => {
            let files =   Array.from(input.files);
            chosenVideo = files[0]
            if (chosenVideo) {
                videoSrc = URL.createObjectURL(chosenVideo);
                resolve(videoSrc);
            }else{
                reject("No video file selected.");
            }
        }

        input.click();
    });
}