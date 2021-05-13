//Start
var scriptEle = document.getElementById("NicoScript");
var videoUrl = scriptEle.getAttribute("videoUrl");
var mentUrl = scriptEle.getAttribute("mentUrl");

var container = document.createElement("div");
container.className = "Container";
document.body.appendChild(container);

if(typeof ytPlayer == "undefined")
{
    var isYoutube = false;
}

if(!isYoutube)
{
    var video = document.createElement("video");
    video.className = "Video";
    video.controls = true;
    video.src = videoUrl;
    video.addEventListener('webkitfullscreenchange', ()=>exitFullscreen());
    container.appendChild(video);
}
else
{
    var ytPlayerReplaceInterval = setInterval(()=>
    {
        if(typeof ytPlayer == "object")
        {
            var ytFrame = document.getElementById("ytplayer");
            container.insertBefore(ytFrame,canvas);
            clearInterval(ytPlayerReplaceInterval);
            console.log("ytPlayerReplaceInterval");
        }
    });
}

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
expandButton.addEventListener("click",()=>toggleFullScreen(container));

var loadingButton = document.createElement("button");
loadingButton.className ="Loading";
loadingButton.textContent = "Loading...";
container.appendChild(loadingButton);

var ctx = canvas.getContext("2d");
var fontSize = scriptEle.getAttribute("fontSize");
var textAlpha = scriptEle.getAttribute("textAlpha");
var addMentSpeed = scriptEle.getAttribute("mentSpeed");
var mentSpeed = 0.25;
var mentFixIter = 1;
var mentFixCount = 0;
if(addMentSpeed != null)
{
    mentSpeed *= Number(addMentSpeed);
    console.log("mentSpeed:"+mentSpeed);
}
var useFont ="Nanum Gothic";
var g_MentList;
var CheckMentBoxColInterval = 0;

//Process
fetch(mentUrl).then(res=>res.text())
.then(data=>
    {
        g_MentList = ReadNicoComments(data,fontSize);
        UpdateMentYAll(g_MentList,canvas);
        setInterval(()=>UpdateText());
        CheckMentBoxColInterval = setInterval(()=>CheckMentBoxCol());
        loadingButton.style.display = "none";
        /*
        for(var ml of mentList)
        {
            console.log(ml.timeline+":"+ml.comment+":"+ml.pos+":"+ml.color+":"+ml.size+":"+ml.height+":"+ml.width+"\n");
            
        }*/
    })
    .catch(err=>console.log(err));

//function
function CheckBoxCol(x1,y1,w1,h1,x2,y2,w2,h2)
{
    var maxX1 = (x1+w1);
    var maxY1 = (y1+h1);
    var maxX2 = (x2+w2);
    var maxY2 = (y2+h2);
    if (maxX1 < x2 || x1 > maxX2)
    {
        return false;
    }
    if (maxY1 < y2 || y1> maxY2) 
    {
        return false;
    }
    return true;
}
function FixColMentY(ment,mentX,duration,fullLength)
{
    var i;
    for(i=0;i<mentFixIter;i++)
    {
        for(var colMent of g_MentList)
        {
            if(colMent.timeline == ment.timeline)
            {
                continue;
            }
            var colX = (colMent.timeline / duration) * fullLength;
            if(CheckBoxCol(mentX,ment.posY,ment.width,ment.height
                ,colX,colMent.posY,colMent.width,colMent.height))
            {
                //console.log(ment.comment + "(Col)");
                UpdateMentY(ment,canvas);
                mentFixCount++;
            }
        }
    }
}

function CheckMentBoxCol()
{
    var duration = 0;
    if(isYoutube)
    {
        if(!IsYoutubeLoaded())
        {
            return;
        }
        duration = ytPlayer.getDuration();
    }
    else
    {
        duration = video.duration;
    }

    var fullLength = duration * canvas.width * mentSpeed;
    for(var ment of g_MentList)
    {
        var mentX = (ment.timeline / duration) * fullLength;
        FixColMentY(ment,mentX,duration,fullLength);
    }
    clearInterval(CheckMentBoxColInterval);
    console.log("mentFixCount:" + mentFixCount);
    console.log("clearInterval(CheckMentBoxColInterval)");
}

function IsYoutubeLoaded()
{
    if(!ytPlayer || ytPlayer.getDuration == null || ytPlayer.getCurrentTime == null)
    {
        return false;
    }
    return true;
}

function UpdateText()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var duration = 0;
    var currentTime;
    if(isYoutube)
    {
        if(!IsYoutubeLoaded())
        {
            return;
        }
        duration = ytPlayer.getDuration();
        currentTime = ytPlayer.getCurrentTime();
    }
    else
    {
        duration = video.duration;
        currentTime = video.currentTime;
    }
    var fullLength = duration * canvas.width * mentSpeed;
    for(var ment of g_MentList)
    {
        //var oriMentX = ((ment.timeline / duration) * fullLength) + canvas.width;
        //var videoX = ((currentTime / duration) * fullLength);
        var mentX = (((ment.timeline - currentTime) / duration) * fullLength) + canvas.width;
        if(mentX + ment.width < 0 || mentX > canvas.width)
            continue;
        //ctx.fillRect(mentX,ment.posY,ment.width,ment.height);
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
        ctx.strokeText(text, canvas.width/2, y);
        ctx.fillText(text, canvas.width/2, y);
    }
    else if(pos == 2) //top
    {
        ctx.textAlign = "center";
        ctx.textBaseline = "Middle";
        ctx.strokeText(text, canvas.width/2, y);
        ctx.fillText(text, canvas.width/2, y);
    }
}

function toggleFullScreen(element) {
	var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement ||
        document.webkitFullscreenElement || document.msFullscreenElement;
    if(fullscreenElement)
    {
        exitFullscreen();
        //screen.orientation.unlock();
    }
    else
    {
        launchIntoFullscreen(element);
        //makeLandscape();
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

function UpdateMentYAll(mentList,canvasEle)
{
    for(var ment of mentList)
    {
        UpdateMentY(ment,canvasEle);
    }
}
function UpdateMentY(ment,canvasEle)
{
    if(ment.pos == 0) //for regular moving comment,
    {
        var randY = rand(0,canvasEle.height-ment.size);
        ment.posY = randY;
    }
    else if(ment.pos == 1) //bottom
    {
        var randY = rand((canvasEle.height/2) + ment.size,canvasEle.height-ment.size);
        ment.posY = randY;
    }
    else if(ment.pos == 2) //top
    {
        var randY = rand(ment.size,(canvasEle.height/2) - ment.size);
        ment.posY = randY;
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
                    pos = 2;
                }
                else if(ms == 'shita')
                {
                    pos = 1;
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

function hexToRgb(hex) 
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}

function makeLandscape() {
    // this works on android, not iOS
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape');
    }
}