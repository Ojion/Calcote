document.addEventListener('DOMContentLoaded', () => {
    const wheelElement = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const resultDisplay = document.getElementById('result-display');

    const numberOfSlices = 20;
    const anglePerSlice = 360 / numberOfSlices; // 18 degrees

    // Outcome definitions (full names for announcement, short for slices)
    const outcomes = [
        { name: "In The Zone", short: "IN", color: "#27ae60" }, // Darker Green
        { name: "Not In The Zone", short: "OUT", color: "#c0392b" } // Darker Red
    ];

    let isSpinning = false;
    let currentWheelRotation = 0; // Tracks the wheel's actual rotation

    // Generate Slices
    for (let i = 0; i < numberOfSlices; i++) {
        const slice = document.createElement('div');
        slice.classList.add('slice');

        const outcomeIndex = i % 2; // 0 for "In The Zone", 1 for "Not In The Zone"
        const currentOutcome = outcomes[outcomeIndex];

        slice.classList.add(outcomeIndex === 0 ? 'slice-in-zone' : 'slice-not-in-zone');
        slice.dataset.sliceIndex = i; // Original index for targeting
        slice.dataset.zoneName = currentOutcome.name; // Full name for logic

        // Calculate the rotation for this slice div
        const sliceRotation = i * anglePerSlice;
        slice.style.transform = `rotate(${sliceRotation}deg)`;

        // Add text span to the slice
        const textSpan = document.createElement('span');
        textSpan.textContent = currentOutcome.short;

        // Counter-rotate the text span to keep text horizontal
        // The span itself is positioned within the unrotated slice's clip-path area
        // This rotation is relative to the slice's own rotation
        textSpan.style.transform = `rotate(${-sliceRotation}deg)`;

        slice.appendChild(textSpan);
        wheelElement.appendChild(slice);
    }

    const allSlices = wheelElement.querySelectorAll('.slice'); // Get all generated slices

    spinButton.addEventListener('click', () => {
        if (isSpinning) return;

        isSpinning = true;
        spinButton.disabled = true;
        resultDisplay.textContent = "Spinning...";
        resultDisplay.style.color = "#555"; // Reset color

        // Remove any previous winning visual effect
        allSlices.forEach(s => s.classList.remove('winning-slice-visual-effect'));

        // 1. Determine the winning outcome type (In The Zone or Not In The Zone)
        const winningOutcomeTypeIndex = Math.floor(Math.random() * outcomes.length);
        const winningOutcome = outcomes[winningOutcomeTypeIndex];

        // 2. Find all slices that match this winning outcome type
        const candidateSliceIndices = [];
        allSlices.forEach((slice) => {
            if (slice.dataset.zoneName === winningOutcome.name) {
                candidateSliceIndices.push(parseInt(slice.dataset.sliceIndex));
            }
        });

        // 3. Randomly pick one of these candidate slices to be the "winning" one
        const targetSliceActualIndex = candidateSliceIndices[Math.floor(Math.random() * candidateSliceIndices.length)];

        // 4. Calculate rotation for the wheel
        // The target slice (targetSliceActualIndex) is initially at `targetSliceActualIndex * anglePerSlice`
        // We want this slice to align with the pointer (0 degrees).
        // So, the wheel needs to rotate by `-(targetSliceActualIndex * anglePerSlice)` relative to its starting position.
        const rotationToAlignSlice = -(targetSliceActualIndex * anglePerSlice);

        // Add multiple full spins for visual effect
        const randomExtraSpins = 3 + Math.floor(Math.random() * 3); // 3 to 5 full spins
        const fullSpinsRotation = randomExtraSpins * 360;

        // Calculate the final target rotation angle for the wheel
        // We want to spin smoothly from currentWheelRotation to the new target
        // The targetAngle is the desired *end position* (modulo 360)
        // The finalRotation includes full spins and lands on the targetAngle
        let finalRotation = fullSpinsRotation + rotationToAlignSlice;

        // To ensure it always spins forward from the current visual rotation, adjust:
        // Add currentWheelRotation to ensure it's relative to the start of this spin
        // but currentWheelRotation is cumulative. We need to make sure final lands on targetAngle
        // Easiest: `targetAngleForSpin = finalRotation`
        // `wheel.style.transform = rotate(${currentWheelRotation + targetAngleForSpin}deg)` NO

        // Let currentWheelRotation be the starting point of the CSS animation.
        // The new end point of the CSS animation is `newWheelEndRotation`
        // The difference between `newWheelEndRotation % 360` and `rotationToAlignSlice % 360` should be 0.
        
        // The desired final orientation of the wheel (mod 360)
        const desiredFinalOrientation = rotationToAlignSlice;

        // Total rotation for CSS:
        // Start from currentWheelRotation, add full spins, then add delta to reach desiredFinalOrientation
        let totalCssRotation = currentWheelRotation;
        // Add full spins (making sure it moves forward)
        totalCssRotation += fullSpinsRotation;
        // Adjust to ensure the final landing position is correct
        // Add the difference to get from (totalCssRotation % 360) to (desiredFinalOrientation % 360)
        let currentOrientation = totalCssRotation % 360;
        if (currentOrientation < 0) currentOrientation += 360; // Normalize positive

        let diffToTarget = desiredFinalOrientation - currentOrientation;
        // Ensure diffToTarget results in forward motion if added directly, or add 360
        // if (diffToTarget < -180) diffToTarget += 360; // Prefer shorter forward spin
        // if (diffToTarget > 180 && totalCssRotation > currentWheelRotation) diffToTarget -=360; // Prefer shorter backward if already spinning a lot

        totalCssRotation += diffToTarget;
        
        // Ensure it spins at least the fullSpinsRotation from where it currently is visually
        if (totalCssRotation < currentWheelRotation + fullSpinsRotation - anglePerSlice) { // -anglePerSlice for tolerance
             totalCssRotation += 360 * Math.ceil((currentWheelRotation + fullSpinsRotation - totalCssRotation) / 360);
        }


        wheelElement.style.transform = `rotate(${totalCssRotation}deg)`;
        currentWheelRotation = totalCssRotation; // Update for the next spin

        // 5. Handle result display after spin animation
        setTimeout(() => {
            resultDisplay.textContent = `Michael is: ${winningOutcome.name}!`;
            resultDisplay.style.color = winningOutcome.color;

            // Optional: Add a visual effect to the specific winning slice pointed to.
            // The slice at targetSliceActualIndex is the one under the pointer.
            // allSlices[targetSliceActualIndex].classList.add('winning-slice-visual-effect');

            isSpinning = false;
            spinButton.disabled = false;
        }, 4100); // Match CSS transition duration (4s) + a small buffer (100ms)
    });

    // Initial setup text
    resultDisplay.textContent = "Click 'Spin' to find out!";
    resultDisplay.style.color = "#555";
});
