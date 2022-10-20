// define timer (timer is an object)
const timer = {
    // each mode property is set to a certain number of minutes
    pomodoro: 25,  
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0
};

let interval; 

// play the sound each time mainButton is clicked
const buttonSound = new Audio('button-sound.mp3'); 
// once start button is clicked, call startTimer()
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
    buttonSound.play(); 
    const { action } = mainButton.dataset; 
    if (action === 'start') {
        startTimer(); 
    } else{
        stopTimer();
    }
}); 

// update countdown with appropriate amount of minutes and seconds once any button is clicked
const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

// takes timestamp as argument
function getRemainingTime(endTime) {  
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;  // in ms

    const total = Number.parseInt(difference / 1000, 10); 
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10); 

    return {
        total,
        minutes,
        seconds,
    };
}

// add ability to start and count down to 0
function startTimer() {
    let { total } = timer.remainingTime; 
    const endTime = Date.parse(new Date()) + total * 1000;  // get timestamp of current time (in ms) then add total in session to it
    
    // increment sessions property at the start of the pomodoro session
    if (timer.mode === 'pomodoro') {timer.sessions++};  

    mainButton.dataset.action = 'stop'; 
    mainButton.textContent = 'stop';  // change text content to 'stop' once countdown starts
    mainButton.classList.add('active'); 

    // setInterval executes callback function every 1000 ms
    interval = setInterval(function() {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();  // updates countdown

        total = timer.remainingTime.total; 
        if (total <= 0) {
            clearInterval(interval);

            // auto-switch the next session upon completion of current one
            switch (timer.mode) {
                case 'pomodoro':
                    if (timer.sessions % timer.longBreakInterval === 0) {
                        switchMode('longBreak');
                    } else {
                        switchMode('shortBreak'); 
                    }
                    break;
                default:
                    switchMode('pomodoro'); 
            }

            if (Notification.permission === 'granted') {
                const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!'; 
                new Notification(text);
            }

            document.querySelector(`[data-sound]="${timer.mode}"]`).play();

            startTimer(); 
        }
    }, 1000);
}

// stops the timer
function stopTimer() {
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active'); 
}

// Get minutes and seconds and pads them to length of 2
function updateClock() {
    const { remainingTime } = timer; 
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds'); 
    min.textContent = minutes;
    sec.textContent = seconds; 

    // modify title depending if current mode is set to pomodoro or not
    const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!'; 
    document.title = `${minutes}:${seconds} - ${text}`; 

    // progress bar updates when value of progress element updated
    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total; 
}

// switch mode according to the selected mode
function switchMode(mode) {
    // adds new properties to timer
    timer.mode = mode;  // set to current mode in pomodoro 
    timer.remainingTime = {  
        total: timer[mode] * 60,  // total = seconds remaining
        minutes: timer[mode], 
        seconds: 0,  
    };

    document  // set active class to currently selected mode (button clicked)
        .querySelectorAll('button[data-mode]')  
        .forEach(e => e.classList.remove('active'));  
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active') 
    document.body.style.backgroundColor = `var(--${mode})`; 
    document
        .getElementById('js-progress')
        .setAttribute('max', timer.remainingTime.total); 

    updateClock(); 
};

// event listener that detects click
function handleMode(event) {
    const { mode } = event.target.dataset;
    if (!mode) {  // if no buttons from specified modeButtons were clicked
        return;
    };   
    switchMode(mode);
    stopTimer(); 
};

// ensure detault mode is 'pomodoro', mode & remainingTime set on timer object
document.addEventListener('DOMContentLoaded', () => {
    // check if browser supports notifications
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            // ask user for permission
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    new Notification(
                        'Awesome! You will be notified at the start of each session.'
                    ); 
                }
            }); 
        }
    }

    switchMode('pomodoro');
});



