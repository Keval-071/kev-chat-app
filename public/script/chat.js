const socket = io();   

//elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton= $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
//Templates
const messageTemplates = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix : true})

const autoscroll = ()=>{
    const $newMessage = $messages.lastElementChild;

    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;

    const containerHeight = $messages.scrollHeight;

    const scrollOffset =  $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
    
}


socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplates,{
        username : message.username,
        message : message.text ,
        createdAt : moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll();
})

socket.on('locationMessage',(message)=>{
    console.log(message);
    const html =Mustache.render(locationMessageTemplate,{
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('h:mm a')

    });
    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll();
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    //above line of code will disable the button

    const message = e.target.elements.message.value;
    socket.emit('sendMessage',message,(error)=>{
         
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();
        //this above line will enable the button

        if(error){
            return console.log(error)
        }

        console.log('Message Delivered !')
    });
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert("Your browser don't support geolocation !")
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendLocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared !');
        })

    })
})

socket.emit('join',{ username,room},(error)=>{
    if(error){
        alert(error);
        location.href= '/'
    }

})