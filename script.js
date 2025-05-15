document.addEventListener('DOMContentLoaded', () => {
    const wheelElement = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const resultDisplay = document.getElementById('result-display');

    const numberOfSlices = 20;
    const anglePerSlice = 360 / numberOfSlices; // 18 degrees

    const outcomes = [
        { name: "In The Zone", short: "IN", color: "#27ae60" },     // Index 0 (Green)
        { name: "Not In The Zone", short: "OUT", color: "#c0392b" } // Index 1 (Red)
    ];

    let isSpinning = false;
    let currentWheelRotation = 0;

    // Generate Slices (This part remains unchanged)
    for (let i = 0; i < numberOfSlices; i++) {
        const slice = document.createElement('div');
        slice.classList.add('slice');
        const outcomeIndex = i % 2;
        const currentOutcome = outcomes[outcomeIndex];
        slice.classList.add(outcomeIndex === 0 ? 'slice-in-zone' : 'slice-not-in-zone');
        slice.dataset.sliceIndex = i;
        slice.dataset.zoneName = currentOutcome.name;
        const sliceRotation = i * anglePerSlice;
        slice.style.transform = `rotate(${sliceRotation}deg)`;
        const textSpan = document.createElement('span');
        textSpan.textContent = currentOutcome.short;
        textSpan.style.transform = `rotate(${-sliceRotation}deg)`;
        slice.appendChild(textSpan);
        wheelElement.appendChild(slice);
    }

    const allSlices = wheelElement.querySelectorAll('.slice');

    spinButton.addEventListener('click', () => {
        if (isSpinning) return;

        isSpinning = true;
        spinButton.disabled = true;
        resultDisplay.textContent = "Spinning...";
        resultDisplay.style.color = "#555";

        allSlices.forEach(s => s.classList.remove('winning-slice-visual-effect'));

        // --- MODIFIED SECTION FOR WEIGHTED RANDOM CHOICE ---
        // 1. Determine the winning outcome type with weighted probability
        // 50% chance for "In The Zone" (outcomes[0])
        // 50% chance for "Not In The Zone" (outcomes[1])
        const randomNumber = Math.random(); // Generates a float between 0 (inclusive) and 1 (exclusive)
        let winningOutcome;

        if (randomNumber < 0.50) { // 0.0 to 0.4999... (50% probability)
            winningOutcome = outcomes[0]; // "In The Zone"
        } else { // 0.50 to 0.999... (50% probability)
            winningOutcome = outcomes[1]; // "Not In The Zone"
        }
        // --- END OF MODIFIED SECTION ---

        // For debugging, you can log the chosen outcome:
        // console.log("Chosen outcome:", winningOutcome.name, "(Random number:", randomNumber.toFixed(4) + ")");


        // 2. Find all slices that match this winning outcome type
        const candidateSliceIndices = [];
        allSlices.forEach((slice) => {
            // Ensure comparison is with the chosen winningOutcome.name
            if (slice.dataset.zoneName === winningOutcome.name) {
                candidateSliceIndices.push(parseInt(slice.dataset.sliceIndex));
            }
        });
        
        // If candidateSliceIndices is empty, something went wrong (e.g., typo in names)
        // but with the current setup, it should always find 10 candidates.
        if (candidateSliceIndices.length === 0) {
            console.error("Error: No candidate slices found for outcome:", winningOutcome.name);
            // Fallback or error handling
            isSpinning = false;
            spinButton.disabled = false;
            resultDisplay.textContent = "Error in spin logic!";
            return;
        }


        // 3. Randomly pick one of these candidate slices to be the "winning" one
        const targetSliceActualIndex = candidateSliceIndices[Math.floor(Math.random() * candidateSliceIndices.length)];

        // 4. Calculate rotation for the wheel
        const rotationToAlignSlice = -(targetSliceActualIndex * anglePerSlice);
        const randomExtraSpins = 3 + Math.floor(Math.random() * 3);
        const fullSpinsRotation = randomExtraSpins * 360;

        // Calculate the final target CSS rotation
        // Start with current visual rotation, add full spins, then adjust to land on target
        let totalCssRotation = currentWheelRotation + fullSpinsRotation;

        // Normalize the target orientation (where the chosen slice should end up, i.e. 0 deg for pointer)
        let desiredFinalOrientationNormalized = rotationToAlignSlice % 360;
        if (desiredFinalOrientationNormalized < 0) desiredFinalOrientationNormalized += 360;

        // Current orientation after adding full spins
        let currentOrientationAfterFullSpins = totalCssRotation % 360;
        if (currentOrientationAfterFullSpins < 0) currentOrientationAfterFullSpins += 360;
        
        // Adjustment needed to get from current orientation (after full spins) to desired target orientation
        let adjustment = desiredFinalOrientationNormalized - currentOrientationAfterFullSpins;

        totalCssRotation += adjustment;

        // Ensure the wheel spins forward sufficiently.
        // If totalCssRotation is now less than what one full spin from currentWheelRotation would be,
        // it means the 'adjustment' caused it to "lose" a planned spin or go backward too much.
        // Add 360 until it's at least `currentWheelRotation + fullSpinsRotation` (approximately).
        // This ensures it always completes the minimum visual rotations.
        const minimumTargetRotation = currentWheelRotation + (randomExtraSpins > 0 ? (randomExtraSpins * 360) : 360) - anglePerSlice; // ensure at least one spin if randomExtraSpins was 0
        while (totalCssRotation < minimumTargetRotation || totalCssRotation < currentWheelRotation + 360 - anglePerSlice) { // ensure at least one positive spin
            totalCssRotation += 360;
        }


        wheelElement.style.transform = `rotate(${totalCssRotation}deg)`;
        currentWheelRotation = totalCssRotation;

        // 5. Handle result display after spin animation
        setTimeout(() => {
            resultDisplay.textContent = `Michael is: ${winningOutcome.name}!`;
            resultDisplay.style.color = winningOutcome.color;
            // allSlices[targetSliceActualIndex].classList.add('winning-slice-visual-effect');
            isSpinning = false;
            spinButton.disabled = false;
        }, 4100);
    });

    // Initial setup text
    resultDisplay.textContent = "Click 'Spin' to find out!";
    resultDisplay.style.color = "#555";
});
