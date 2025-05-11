// analyzer/pose-logic.js

// Пример логики для определения девиантного поведения
function isDeviantBehavior(pose) {
    const head = pose.keypoints.find(k => k.part === "nose");
    const leftLeg = pose.keypoints.find(k => k.part === "leftKnee");
    const rightLeg = pose.keypoints.find(k => k.part === "rightKnee");

    if (!head || !leftLeg || !rightLeg) return false;

    const headPosition = head.position;
    const leftLegPosition = leftLeg.position;
    const rightLegPosition = rightLeg.position;

    // Простой пример: если голова и ноги сильно смещены — это может быть девиантное поведение
    if (
        Math.abs(leftLegPosition.y - headPosition.y) > 200 ||
        Math.abs(rightLegPosition.y - headPosition.y) > 200
    ) {
        return true;
    }

    return false;
}

module.exports = { isDeviantBehavior };