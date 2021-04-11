//Data
var MentXmlDoc;
var MentFileName;

//Scene 0
var Scene0_Input = document.createElement("input");
Scene0_Input.type = "file";
Scene0_Input.addEventListener("change", OnUploadXml, false);
document.body.appendChild(Scene0_Input);

var Scene0_Desc = document.createElement("div");
Scene0_Desc.innerHTML = "멘트 파일을 선택해주세요.(Select Ment Xml File)";
document.body.appendChild(Scene0_Desc);

function Scene0_SetActive(bActive)
{
    if(bActive)
    {
        document.body.appendChild(Scene0_Input);
        document.body.appendChild(Scene0_Desc);
    }
    else
    {
        document.body.removeChild(Scene0_Input);
        document.body.removeChild(Scene0_Desc);
    }
}

//Scene 1
var Scene1_XmlField = document.createElement("textarea");
Scene1_XmlField.cols = 50;
Scene1_XmlField.rows = 25;

var Scene1_Desc = document.createElement("div");
Scene1_Desc.innerText = "텍스트 번역후 버튼을 눌러주세요.";
Scene1_Desc.innerText += "\n(Click button after Translate)";

var Scene1_DownButton = document.createElement("button");
Scene1_DownButton.innerText = "Download";
Scene1_DownButton.onclick = OnScene1DownButton;

function Scene1_SetActive(bActive)
{
    if(bActive)
    {
        document.body.appendChild(Scene1_XmlField);
        document.body.appendChild(Scene1_Desc);
        document.body.appendChild(Scene1_DownButton);
    }
    else
    {
        document.body.removeChild(Scene1_XmlField);
        document.body.removeChild(Scene1_Desc);
        document.body.removeChild(Scene1_DownButton);
    }
}

function OnUploadXml()
{
    var fileList = this.files;
    for (let i = 0, numFiles = fileList.length; i < numFiles; i++) 
    {
        var file = fileList[i];
        if(file.name.toLowerCase().endsWith('xml'))
        {
            Scene0_SetActive(false);
            Scene1_SetActive(true);
            ReadText(file,(e)=>
            {
                MentFileName = file.name;
                MentXmlDoc = XmlParse(e);
                ExtractMent(MentXmlDoc,(e)=>
                {
                    Scene1_XmlField.value += e + "\n";
                });
            });
            return ;
        }
    }
}

function ExtractMent(doc,onAdd)
{
    var chats = doc.getElementsByTagName("chat");
    for(var chat of chats)
    {
        onAdd(chat.innerHTML);
    }
}
function ReplaceMent(doc,text)
{
    var ments = text.split('\n');
    var chats = doc.getElementsByTagName("chat");
    for(let i=0,length = chats.length;i<length;i++)
    {
        var chat = chats[i];
        chat.innerHTML = ments[i];
    }
}

function ReadText(file,onLoadFile)
{
    var reader = new FileReader();
    reader.onload = function(e) {
        onLoadFile(e.target.result);
    }
    reader.readAsText(file);
}

function XmlParse(xmlText)
{
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlText, "application/xml");
    return doc;
}
function XmlDocToText(doc)
{
    return new XMLSerializer().serializeToString(doc);
}

function OnScene1DownButton()
{
    ReplaceMent(MentXmlDoc,Scene1_XmlField.value);
    var MentText = XmlDocToText(MentXmlDoc);
    var blob = new Blob([MentText], {type: "text/plain;charset=utf-8"});
    saveAs(blob, MentFileName);
}