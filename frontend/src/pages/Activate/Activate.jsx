import React, { useState } from 'react';
import StepName from '../Steps/StepName/StepName';
import StepAvatar from '../Steps/StepAvatar/StepAvatar';
import { toast } from 'sonner';

const steps = {
    1: StepName,
    2: StepAvatar,
};

const Activate = () => {
    const [step, setStep] = useState(1);
    const Step = steps[step];

    function onNext() {
        if(step===1) toast.success('Name saved✅')
        setStep(step + 1);
    }
    return (
        <div className="cardWrapper">
            <Step onNext={onNext}></Step>
        </div>
    );
};

export default Activate;