//CreateHtml
var scriptEle = document.getElementById("NicoScript");
var videoUrl = scriptEle.getAttribute("videoUrl");
var mentUrl = scriptEle.getAttribute("mentUrl");

var container = document.createElement("div");
container.className = "Container";
document.body.appendChild(container);

var video = document.createElement("video");
video.className = "Video";
video.controls = true;
video.src = videoUrl;
container.appendChild(video);

var canvas = document.createElement("canvas");
canvas.className = "Canvas";
canvas.width = 1280;
canvas.height = 720;
container.appendChild(canvas);

var expandButton = document.createElement("div");
expandButton.className = "ExpandButton";
container.appendChild(expandButton);

var expandIcon = document.createElement("i");
expandIcon.className = "fas fa-expand";
expandButton.appendChild(expandIcon);

var loadingButton = document.createElement("button");
loadingButton.className ="Loading";
loadingButton.textContent = "Loading...";
container.appendChild(loadingButton);

//Start
//var video = document.getElementById("NicoVideo");
//var canvas = document.getElementById("NicoCanvas");
var ctx = canvas.getContext("2d");
//var container = document.getElementById('NicoContainer');
//var iframeEle = window.parent.document.getElementById("NicoPlayer");
//var videoUrl = iframeEle.getAttribute("videoUrl");
//var mentUrl = iframeEle.getAttribute("mentUrl");
var fontSize = 30;
var textAlpha = 1;
//var expandButton = document.querySelector(".ExpandButton");
//var loadingButton = document.querySelector(".Loading");
var mentSpeed = 0.25;
var useFont ="Nanum Gothic";
var g_MentList;
//Process
//video.setAttribute("src",videoUrl);
expandButton.addEventListener("click",()=>toggleFullScreen(container));


fetch(mentUrl).then(res=>res.text())
.then(data=>
    {
        g_MentList = ReadNicoComments(data,fontSize);
        UpdateMentY(g_MentList,canvas);
        setInterval(()=>UpdateText());
        loadingButton.style.display = "none";
        /*
        for(var ml of mentList)
        {
            console.log(ml.timeline+":"+ml.comment+":"+ml.pos+":"+ml.color+":"+ml.size+":"+ml.height+":"+ml.width+"\n");
            
        }*/
    })
    .catch(err=>console.log(err));

function UpdateText()
{
    var fullLength = video.duration * canvas.width * mentSpeed;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var ment of g_MentList)
    {
        var oriMentX = ((ment.timeline / video.duration) * fullLength) + canvas.width;
        var videoX = ((video.currentTime / video.duration) * fullLength);
        var mentX = oriMentX - videoX;
        if(mentX + ment.width < 0 || mentX > canvas.width)
            continue;
        DrawText(mentX,ment.posY,ment.comment,ment.size,ment.pos,ment.color);
    }
}

function DrawText(x,y,text,size,pos,color)
{
    var rgb = hexToRgb(color);
    ctx.font = size +"px "+ useFont;
    ctx.fillStyle = "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+textAlpha+")";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,"+textAlpha+")";
    if(pos == 0) //normal
    {
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    }
    else if(pos == 1) //bottom
    {
        ctx.textAlign = "center";
        ctx.textBaseline = "Middle";
        ctx.strokeText(text, canvas.width/2, canvas.height * 0.9);
        ctx.fillText(text, canvas.width/2, canvas.height * 0.9);
    }
    else if(pos == 2) //top
    {
        ctx.textAlign = "center";
        ctx.textBaseline = "Middle";
        ctx.strokeText(text, canvas.width/2, canvas.height *0.1);
        ctx.fillText(text, canvas.width/2, canvas.height *0.1);
    }
}

function toggleFullScreen(element) {
	var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement ||
        document.webkitFullscreenElement || document.msFullscreenElement;
    if(fullscreenElement)
    {
        exitFullscreen();
    }
    else
    {
        launchIntoFullscreen(element);
    }
}

function launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
 }

function UpdateMentY(mentList,canvasEle)
{
    for(var ment of mentList)
    {
        if(ment.pos == 0) //for regular moving comment,
        {
            var randY = rand(0,canvasEle.height-ment.size);
            ment.posY = randY;
        }
        else if(pos == 1) //bottom
        {
            var randY = rand((canvasEle.height/2) + ment.size,canvasEle.height-ment.size);
            ment.posY = randY;
        }
        else if(pos == 2) //top
        {
            var randY = rand(ment.size,(canvasEle.height/2) - ment.size);
            ment.posY = randY;
        }
        //console.log(ment.timeline);
    }
}
function ReadNicoComments(xmlFile,fsize)
{
    var NiconicoColorMap = {'red': '#ff0000', 'pink': '#ff8080', 'orange': '#ffcc00', 'yellow': '#ffff00', 'green': '#00ff00', 'cyan': '#00ffff', 'blue': '#0000ff', 'purple': '#c000ff', 'black': '#000000', 'niconicowhite': '#cccc99', 'white2': '#cccc99', 'truered': '#cc0033', 'red2': '#cc0033', 'passionorange': '#ff6600', 'orange2': '#ff6600', 'madyellow': '#999900', 'yellow2': '#999900', 'elementalgreen': '#00cc66', 'green2': '#00cc66', 'marineblue': '#33ffcc', 'blue2': '#33ffcc', 'nobleviolet': '#6633cc', 'purple2': '#6633cc'}
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlFile,"text/xml");
    var comment_element = xmlDoc.getElementsByTagName('chat');
    var CommentArray = [];
    for(var comment of comment_element)
    {
        try
        {
            if(comment.childNodes[0] == null)
                continue;
            var text = comment.childNodes[0].textContent;
            if(text.startsWith('/'))
            {
                continue;
            }
            var pos = 0;
            var color = '#ffffff';
            var size = fsize;
            var mail = comment.getAttribute('mail');
            var mailstyle = mail.split(' ');
            var vpos = Math.max(comment.getAttribute('vpos'), 0) * 0.01;
            for(var ms of mailstyle)
            {
                if(ms == 'ue')
                {
                    pos = 1;
                }
                else if(ms == 'shita')
                {
                    pos = 2;
                }
                else if(ms == 'big')
                {
                    size = fsize * 1.44;
                }
                else if(ms == 'small')
                {
                    size = fsize * 0.64;
                }
                else if(ms in NiconicoColorMap)
                {
                    color = NiconicoColorMap[ms];
                }
            }
            var height = size;
            var width = text.length * size;
            CommentArray.push(new CommentData(vpos,text,pos,color,size,height,width));
        }
        catch (error) 
        {
            console.error(error);
        }
    }
    return CommentArray;
}

class CommentData
{
    constructor(timeline,comment,pos,color,size,height,width)
    {
        this.timeline = timeline;
        this.comment = comment;
        this.pos = pos;
        this.color = color;
        this.size = size;
        this.height = height;
        this.width = width;
        this.posY = 0;
    }
}

function rand(start, end)
{
    return Math.floor((Math.random() * (end-start+1)) + start);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }