window.onload = () => {
    // Select elements from the DOM
    let elevator = document.querySelector(".elevator");
    let leftDoor = elevator.querySelector(".left-door");
    let rightDoor = elevator.querySelector(".right-door");
    let floors = document.querySelectorAll(".building .floor");
    let buttons = document.querySelectorAll(".handle button");
    let startButton = document.getElementById("start-button");
    let resetButton = document.getElementById("reset-button");
    let display = document.querySelector(".display");
    let displaySteps = document.querySelector(".displaySteps"); // Select the steps display element

    // Variables initialization
    var destinyFloors = [];
    var currentFloor = floors[0]; 
    var leavingFloor = false;
    var elevatorStatus = 'idle';
    var elevatorWaitingTime = 2000;
    var elevatorWaitTime = 2000;
    var previousTime = new Date().getTime();
    var deltaTime = 0;
    var floorCount = 0;

    // Initial setup
    leftDoor.style.width = "1px";
    rightDoor.style.width = "1px";
    elevator.style.top = floors[0].offsetTop + "px"; // Set elevator's top position to the 5th floor position

    // Function to update display information
    function updateDisplay() {
        var destinyFloorsText = "<span style='color: white;'>Destination floors: </span>";
        destinyFloors.forEach((floor, index) => {
            destinyFloorsText += "<span style='color: white;'>" + ["0", "1st", "2nd", "3rd", "4th", "5th"][parseInt(floor.getAttribute("data-floor"))] + "</span>";
            if (index < destinyFloors.length - 1) {
                destinyFloorsText += ", ";
            }
        });
        display.innerHTML = destinyFloorsText;
    }

    // Function to update display for steps
    function updateStepsDisplay() {
        displaySteps.style.color = "white"; // Set the text color to white
        displaySteps.textContent = "Floors passed: " + floorCount;
    }

    // Display destination floors when the page loads
    updateDisplay();

    function handleClick() {
        if (elevatorStatus === 'idle') {
            let setFloor = this.getAttribute("data-set-floor");
            let selectedFloor = Array.prototype.slice.apply(document.querySelectorAll(".building .floor")).filter(f => f.getAttribute("data-floor") == setFloor)[0];
            if (selectedFloor) {
                destinyFloors.push(selectedFloor); 
                updateDisplay(); 
            }
        }
    }
    

    buttons.forEach(button => {
        button.removeEventListener("click", handleClick);
        button.addEventListener("click", handleClick);
    });

    // Event listener for start button
    startButton.addEventListener("click", () => {
        if (destinyFloors.length > 0 && elevatorStatus === 'idle') {
            elevatorStatus = 'moving';
            updateElevator();
        } else {
            console.log("No floors selected or elevator is already moving.");
        }
    });

    // Event listener for reset button
    resetButton.addEventListener("click", function() {
        location.reload(); // Reload the page when the reset button is clicked
    });

    // Function to open left door
    function openLeftDoor() {
        if (leftDoor.offsetWidth > 1) {
            leftDoor.style.width = leftDoor.offsetWidth - 1 + "px";
        }
    }

    // Function to open right door
    function openRightDoor() {
        if (rightDoor.offsetWidth > 1) {
            rightDoor.style.width = rightDoor.offsetWidth - 1 + "px";
        }
    }

    // Function to close left door
    function closeLeftDoor() {
        if (leftDoor.offsetWidth < 45) {
            leftDoor.style.width = leftDoor.offsetWidth + 1 + "px";
        }
    }

    // Function to close right door
    function closeRightDoor() {
        if (rightDoor.offsetWidth < 45) {
            rightDoor.style.width = rightDoor.offsetWidth + 1 + "px";
        }
    }

    // Function to update elevator state
    function updateElevator() {
        // Calculate time elapsed since last update
        deltaTime = new Date().getTime() - previousTime;
        previousTime = new Date().getTime();

        // Request animation frame for continuous update
        requestAnimationFrame(updateElevator);

        // Check elevator position relative to floors
        var elevatorWithinFloor = false;
        for (let i = 0; i < floors.length; i++) {
            if (elevator.offsetTop > floors[i].offsetTop && elevator.offsetTop < floors[i].offsetTop + 10) {
                elevatorWithinFloor = true;
                currentFloor = floors[i];
                if (!leavingFloor) {
                    while (destinyFloors.includes(currentFloor)) { // Ensure elevator stops at each occurrence of the floor
                        destinyFloors.splice(destinyFloors.indexOf(currentFloor), 1); // Remove the current floor from destinyFloors
                        elevatorStatus = 'opening'; // Open the doors at each occurrence of the floor
                    }
                }
            }
        }

        // If elevator is not within any floor
        if (!elevatorWithinFloor) {
            if (leavingFloor) {
                leavingFloor = false;
            }
        }

        // Update elevator status
        if (elevatorStatus != 'moving') {
            if (elevatorStatus == 'opening') {
                openLeftDoor();
                openRightDoor();
                if (leftDoor.offsetWidth <= 1 && rightDoor.offsetWidth <= 1) {
                    if (destinyFloors.length == 0) {
                        elevatorStatus = 'idle';
                    } else {
                        elevatorStatus = 'waiting';
                        elevatorWaitingTime = elevatorWaitTime;
                    }
                }
            }
            if (elevatorStatus == 'waiting') {
                if (elevatorWaitingTime > 0) {
                    elevatorWaitingTime -= deltaTime;
                } else {
                    elevatorStatus = 'closing';
                }
            }
            if (elevatorStatus == 'closing') {
                closeLeftDoor();
                closeRightDoor();
                if (leftDoor.offsetWidth >= 45 && rightDoor.offsetWidth >= 45) {
                    elevatorStatus = 'moving';
                }
            }
        }

        // Move elevator if it's in motion
        if (destinyFloors[0] != null && elevatorStatus == 'moving') {
            if (destinyFloors[0].offsetTop > elevator.offsetTop - 10) {
                elevator.style.top = elevator.offsetTop - 10 + 2 + "px";
            } else {
                elevator.style.top = elevator.offsetTop - 10 - 2 + "px";
            }

            // Check if elevator passed through a floor
            if (elevator.offsetTop > currentFloor.offsetTop && elevator.offsetTop < currentFloor.offsetTop + 10) {
                floorCount++;
                console.log("Floor count:", floorCount); // Log the floor count to the console
                updateStepsDisplay(); // Update the display for steps
            }
        }
    }
};
