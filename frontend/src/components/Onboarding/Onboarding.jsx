import { useState } from "react";
import GeneralDetails from "./GeneralDetails";
import InvitationPage from "./InvitationPage";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [employerData, setEmployerData] = useState({
    industry: "",
    employeeSize: "",
    emails: [],
    firstName: "",
    email: "",
    number: "",
  });

  const handleNext = (data) => {
    setEmployerData((prevData) => ({ ...prevData, ...data }));
    setStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  return (
    <>
      {step === 1 && <GeneralDetails onNext={handleNext} />}
      {step === 2 && <InvitationPage onNext={handleNext} onBack={handleBack} />}
    </>
  );
};

export default Onboarding;