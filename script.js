document.addEventListener('DOMContentLoaded', () => {
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const resultDisplay = document.getElementById('result-display');
    const ball = document.getElementById('ball');

    const slots = [
        { name: "In The Zone", color: "#2ecc71" },
        { name: "Not In The Zone", color: "#e74c3c" }
    ];

    // The target angles for each slot. For two slots, 0 degrees could be one, 180 degrees the other.
    // The pointer is at the top (0 or 360 degrees).
    // "In The Zone" is the first segment visually (top-right half if wheel starts at 0deg)
    // "Not In The Zone" is the second segment visually (bottom-left half if wheel starts at 0deg)
    // So, landing "In The Zone" means the wheel stops with its "In The Zone" segment at the top.
    // If "In The Zone" takes up 0-180 deg and "Not In The Zone" 180-360 deg:
    // To land on "In The Zone", the final rotation should point its middle (90deg) to the top (0/360). So, rotate wheel by -90.
    // To land on "Not In The Zone", point its middle (270deg) to the top. Rotate wheel by -270 (or +90).

    const slotAngles = {
        "In The Zone": -45,      // Center of the first 180-degree segment
        "Not In The Zone": -225  // Center of the second 180-degree segment (or 135)
    };
    // Let's adjust slot-not-in-the-zone to be positive for easier calculation
    // We want the segment to align with the top pointer.
    // "In The Zone": Segment is from 0 to 180 degrees. Midpoint is 90. To align 90 with 0, rotate by -90.
    // "Not In The Zone": Segment is from 180 to 360. Midpoint is 270. To align 270 with 0, rotate by -270 (or +90).

    // Simpler: Let's define targetRotation directly.
    // Target 0 degree is the top.
    // If "In The Zone" should win, we want its section to be at the top.
    // Our CSS has "In The Zone" as the first child, "Not In The Zone" as the second.
    // They each take up 180 degrees.
    // If wheel.style.transform = rotate(0deg), "In The Zone" is on the right, "Not In The Zone" on the left.
    // To make "In The Zone" win (top), wheel needs to rotate so its right side is at top. Rotate by -90deg.
    // To make "Not In The Zone" win (top), wheel needs to rotate so its left side is at top. Rotate by +90deg.
    const targetRotations = {
        "In The Zone": -90, // Target this segment to be at the top
        "Not In The Zone": 90   // Target this segment to be at the top
    };


    let isSpinning = false;
    let currentRotation = 0;

    spinButton.addEventListener('click', () => {
        if (isSpinning) return;

        isSpinning = true;
        spinButton.disabled = true;
        resultDisplay.textContent = "Spinning...";
        ball.style.opacity = '0'; // Hide ball during spin
        wheel.classList.remove('winning-slot'); // Remove previous highlight

        // 1. Determine the winning slot
        const randomIndex = Math.floor(Math.random() * slots.length);
        const winningSlot = slots[randomIndex];

        // 2. Calculate rotation
        // Base rotations for multiple full spins
        const randomSpins = 3 + Math.floor(Math.random() * 3); // 3 to 5 full spins
        const fullRotations = randomSpins * 360;

        // Get the target rotation for the winning slot
        const targetAngle = targetRotations[winningSlot.name];

        // Total rotation
        // We want to spin *to* targetAngle, from currentRotation
        // To avoid spinning backwards, ensure we add enough full rotations.
        // The final rotation needs to be congruent to targetAngle mod 360.
        let finalRotation = currentRotation + fullRotations + (targetAngle - (currentRotation % 360));

        // Ensure it spins forward and enough
        if (finalRotation < currentRotation + fullRotations) {
             finalRotation += 360;
        }


        // Apply the rotation to the wheel
        wheel.style.transform = `rotate(${finalRotation}deg)`;
        currentRotation = finalRotation; // Store for next spin, though finalRotation will be normalized.


        // 3. Handle "ball" animation and result display after spin
        setTimeout(() => {
            resultDisplay.textContent = `Michael is: ${winningSlot.name}!`;
            resultDisplay.style.color = winningSlot.color;

            // "Land" the ball conceptually (e.g., highlight winning segment or place ball)
            // For simplicity, we're highlighting the whole wheel based on the result display color
            // and announcing. The pointer indicates the "winning" area.

            // If you want to highlight the specific segment:
            const winningElement = document.getElementById(winningSlot.name === "In The Zone" ? 'slot-in-the-zone' : 'slot-not-in-the-zone');
            // Remove previous highlights if any
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('winning-slot'));
            winningElement.classList.add('winning-slot');


            // Position and show ball (optional, simple version)
            // This positions ball in the center of the winning segment after spin.
            // Needs more precise calculation based on segment angles if using.
            // For now, the text result is primary. The pointer indicates the winning "half".
            // ball.style.opacity = '1';
            // if (winningSlot.name === "In The Zone") {
            //     ball.style.transform = 'translate(-50%, -100%) rotate(0deg)'; // Top half of wheel
            // } else {
            //     ball.style.transform = 'translate(-50%, 0%) rotate(0deg)'; // Bottom half of wheel
            // }


            isSpinning = false;
            spinButton.disabled = false;
        }, 4100); // Match CSS transition duration + a small buffer
    });

    // Initial setup (optional, if you want a default display)
    resultDisplay.textContent = "Click 'Spin' to find out!";
    resultDisplay.style.color = "#555";
});
