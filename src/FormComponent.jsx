import React, { useState, useRef, useEffect } from "react";
import { Form, Input, Button, DatePicker, message } from "antd";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";
import logo from "./Images/cryokologo.png";

message.config({
  duration: 3,
  maxCount: 3,
});
const { TextArea } = Input;

const FormComponent = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false); 
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const sigCanvas = useRef();
  const [signatureData, setSignatureData] = useState("");
  const [address, setAddress] = useState("");

  const updateCanvasSize = () => {
    if (sigCanvas.current) {
      const parent = sigCanvas.current.getCanvas().parentNode;
      setCanvasSize({ width: parent.offsetWidth, height: parent.offsetHeight });
    }
  };

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const styl = `
 .ant-form-item .ant-form-item-label >label {
    position: relative;
    display: inline-flex
;
    align-items: center;
    max-width: 100%;
    height: 32px;
    color: rgba(0, 0, 0, 0.88);
    font-size: 17px;
}
    .ant-form-item .ant-form-item-label >label {
    position: relative;
    display: inline-flex
;
    align-items: center;
    max-width: 100%;
    height: 32px;
    color: #1364AE;
    font-size: 17px;
}
  `;

  const handleAddressChange = (e) => {
    let value = e.target.value;
    let lines = value.split("\n");

    // Limit strictly to 5 rows
    if (lines.length > 3 || value.length > 100) {
      message.warning(
        "Input limited to 3 lines, 100 characters. Excess text won't be included."
      );
      value = lines.slice(0, 2).join("\n"); // Trim excess lines
    }

    setAddress(value); // Update state only if within limits
  };
  const [checkboxes, setCheckboxes] = useState({
    diseaseCirculatorySystem: false,
    acuteMyocardialInfarction: false,
    circulatoryInsufficiency: false,
    pastEmbolisms: false,
    unstableHypertension: false,
    openSkinwoundsandinjuries: false,
    frostbite: false,
    feveroractiveacuteinfectiousdiseases: false,
    cryoglobulinemia: false,
    peripheralvasculardiseases: false,
    pregnancy: false,
    undertheinfluenceofalcohol: false,
  });

  const handleSubmit = async (values) => {
    if (!signatureData) {
      message.error(
        "Please provide a signature and click save signature button before submitting the form."
      );
      return;
    }
    setLoading(true);
    // Convert date to 'YYYY-MM-DD' format (removing time)
    const formattedDate = values.date ? values.date.format("YYYY-MM-DD") : "";

    const formDataObject = {
      ...values,
      date: formattedDate, // Send only the date
      // signature: signatureData,
    };

    setFormData(formDataObject);

    try {
      const response = await fetch(
 
        "https://script.google.com/macros/s/AKfycbyAtYL_qiaar906knk2eNJLJ2oOlhcpX7NQBxkWxZPeoXdc8G-ZkFHL5sGS_aCMfylj/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          // body: JSON.stringify(formData),
          body: JSON.stringify(formDataObject),
        }
      );

      const text = await response.text();
      const result = JSON.parse(text);

      if (result.status === "success") {
        message.success("Form submitted successfully!");

        // generatePDF(formData);
        // generatePDF(formDataObject, checkboxes);
        generatePDF({ ...formDataObject, signature: signatureData }, checkboxes);


        setTimeout(() => {
          form.resetFields();
          setSignatureData("");
          sigCanvas.current.clear();
        }, 500);
      } else {
        message.error(`Error: ${result.message}`);
      }
    } catch (error) {
      // console.error("Submission Error:", error);
      message.error("An error occurred while saving data.");
    } finally {
      setLoading(false);

      setCheckboxes({
        diseaseCirculatorySystem: false,
        acuteMyocardialInfarction: false,
        circulatoryInsufficiency: false,
        pastEmbolisms: false,
        unstableHypertension: false,
        openSkinwoundsandinjuries: false,
        frostbite: false,
        feveroractiveacuteinfectiousdiseases: false,
        cryoglobulinemia: false,
        peripheralvasculardiseases: false,
        pregnancy: false,
        undertheinfluenceofalcohol: false,
      });
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureImage = sigCanvas.current
        .getCanvas()
        .toDataURL("image/png");
      setSignatureData(signatureImage);
      setTimeout(() => message.success("Signature saved successfully!"), 0);
    } else {
      message.error("Please draw a signature before saving.");
    }
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxes((prev) => ({
      ...prev,
      [name]: checked, // Store checkbox state correctly
    }));
  };

  const getBase64Image = (imgUrl, callback) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Important for external images
    img.src = imgUrl;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png"); // Convert to Base64
      callback(dataURL);
    };
  };

  const generatePDF = (formData, checkboxes = {}) => {
    const doc = new jsPDF();
    const getBase64Image = (imgUrl, callback) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Prevent CORS issues
      img.src = imgUrl;
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png"); // Convert to Base64
        callback(dataURL);
      };
    };
    getBase64Image(logo, (base64Image) => {
      doc.addImage(base64Image, "PNG", 18, 1, 40, 40); // Add image before text
      // Set up the font for the document
      doc.setFont("helvetica", "normal");

      // Header Section - Company Information
      doc.setFontSize(12); // Smaller font for header
      doc.text(
        "Sree Perthana Enterprises, 9/4-A, Sriram Layout, Coimbatore -641 011",
        60,
        18
      );
      doc.text(
        "cryocbe@gmail.com | www.cryoko.com | Tel: 0422 490 8701",
        60,
        23
      );

      // Add the form title
      doc.setFontSize(18); // Larger font for title
      doc.setFont("helvetica", "bold");
      doc.text("UNDERTAKING AND CONSENT FORM", 20, 47);
      doc.setLineWidth(0.8);
      doc.line(20, 49, 135, 49);

      // Dear Guest Message (Wrap text properly)
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const greetingText =
        "Dear Guest, \nWe request you to kindly read through the below and sign this undertaking and consent form along with your full legal name.";

      // Split long greeting text to fit within page width
      const greetingTextLines = doc.splitTextToSize(greetingText, 180); // Split long text into lines that fit within 180px width
      let yOffset = 55; // Starting yOffset position for text

      // Add each line of greeting text with proper yOffset
      greetingTextLines.forEach((line) => {
        doc.text(line, 20, yOffset);
        yOffset += 5; // Increase yOffset to move to the next line
      });

      // Contraindications Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("CONTRAINDICATIONS FOR WHOLE BODY CRYOKOTHERAPY", 20, 74);
      yOffset += 9; // Add some space after title

      // I validate statement
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const validationText =
        "I validate that I do not suffer from any of the following:";
      doc.text(validationText, 20, 81);
      yOffset += 10;

      // List checkboxes (correct checkbox rendering)
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const checkboxOptions = [
        {
          label: "Diseases of circulatory system",
          key: "diseaseCirculatorySystem",
        },
        {
          label:
            "State of acute myocardial infarction or other serious heart diseases",
          key: "acuteMyocardialInfarction",
        },
        {
          label:
            "Circulatory insufficiency or untreated disturbances of heart rhythm",
          key: "circulatoryInsufficiency",
        },
        { label: "Past embolisms", key: "pastEmbolisms" },
        {
          label: "Unstable arterial hypertension",
          key: "unstableHypertension",
        },
        {
          label: "Open Skin wounds and injuries",
          key: "openSkinwoundsandinjuries",
        },
        { label: "Frostbite", key: "frostbite" },
        {
          label: "Fever or active acute infectious diseases",
          key: "feveroractiveacuteinfectiousdiseases",
        },
        { label: "Cryoglobulinemia", key: "cryoglobulinemia" },
        {
          label: "Peripheral vascular diseases",
          key: "peripheralvasculardiseases",
        },
        { label: "Pregnancy", key: "pregnancy" },
        {
          label: "Under the influence of alcohol",
          key: "undertheinfluenceofalcohol",
        },
      ];

      // console.log("Checkboxes data:", checkboxes); // Debug full checkboxes object

      checkboxOptions.forEach((option) => {
        // console.log("Checking:", option.key, checkboxes?.[option.key]); // Debugging

        const isChecked = !!checkboxes?.[option.key]; // Ensure it's always true/false
        doc.setFont("Zapfdingbats");
        const symbol = isChecked ? "4" : "o"; // '4' = tick, 'o' = bullet
        doc.text(symbol, 20, yOffset);

        doc.setFont("helvetica", "normal");
        const wrappedText = doc.splitTextToSize(option.label, 160);
        doc.text(wrappedText[0], 25, yOffset);
        yOffset += 7;

        for (let i = 1; i < wrappedText.length; i++) {
          doc.text(wrappedText[i], 25, yOffset);
          yOffset += 7;
        }
      });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const incaseText =
        "In case of presence of any ailment mentioned above, I confirm I have a valid Doctor prescription recommending Whole Body Cryotherapy treatment.";
      const incaseTextlines = doc.splitTextToSize(incaseText, 170);
      doc.text(incaseTextlines, 20, yOffset);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("BEFORE THE TREATMENT", 20, 187);
      yOffset += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const beforeTreatmentText =
        "Please be informed that any jewellery and/or any other metal-containing items should not be worn during the treatment. Any wet or damp clothing cannot be worn at any time during the session. Kindly ensure that your skin is dry and without any open wounds.";
      const beforeTreatmentTextlines = doc.splitTextToSize(
        beforeTreatmentText,
        160
      );
      doc.text(beforeTreatmentTextlines, 20, 194);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("AFTER THE TREATMENT", 20, 218);
      yOffset += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const afterTreatmentText =
        "It is advisable to undertake any exercise consisting of cardio exercises after the treatment, for about 20 minutes.";
      const afterTreatmentTextlines = doc.splitTextToSize(
        afterTreatmentText,
        160
      );
      doc.text(afterTreatmentTextlines, 20, 225);

      doc.addPage(); // Move to a new page

      // Reset yOffset for the new page

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("STATEMENT OF UNDERTAKING", 20, 20);
      yOffset += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      const undertakingText =
        "I have carefully read this document and I fully understand its content. I have been personally briefed about the treatment and its outcomes. Knowing the risks involved and the contraindications related - nevertheless, I choose voluntarily to participate in the cryotherapy treatment. I am in good health and have no physical condition expressed in the contraindications or otherwise which would preclude me from safely participating in such treatment. This statement constitutes a waiver and release of any liability on Cryoko Wellness and all of its employees, owners, legal heirs, successors, and legal representatives against any harm, personal injury, or any other unprecedented consequences resulting from the use of the whole body cryotherapy equipment and treatment.";

      const undertakingTextLines = doc.splitTextToSize(undertakingText, 160);
      doc.text(undertakingTextLines, 20, 27);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      yOffset += 10;

      doc.text("Name: ", 20, 80);
      doc.setFont("helvetica", "normal");
      doc.text(formData.name || "N/A", 85, 80);
      yOffset += 7;

      doc.setFont("helvetica", "bold");
      doc.text("Address: ", 20, 90);
      doc.setFont("helvetica", "normal");
      const addressLines = doc.splitTextToSize(formData.address || "N/A", 105);
      doc.text(addressLines, 85, 90);
      yOffset += addressLines.length * 7;

      doc.setFont("helvetica", "bold");
      doc.text("Contact Number: ", 20, 110);
      doc.setFont("helvetica", "normal");
      doc.text(formData.contact || "N/A", 85, 110);
      yOffset += 7;

      doc.setFont("helvetica", "bold");
      doc.text("Emergency Contact Name: ", 20, 120);
      doc.setFont("helvetica", "normal");
      doc.text(formData.emergencyName || "N/A", 85, 120);
      yOffset += 7;

      doc.setFont("helvetica", "bold");
      doc.text("Emergency Contact Number: ", 20, 130);
      doc.setFont("helvetica", "normal");
      doc.text(formData.emergencyNumber || "N/A", 85, 130);
      yOffset += 7;

      doc.setFont("helvetica", "bold");
      doc.text("Date: ", 20, 140);
      doc.setFont("helvetica", "normal");
      doc.text(formData.date || "N/A", 85, 140);
      yOffset += 10;
      if (formData.signature) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Signature:", 20, 152);
        yOffset += 10;

        doc.addImage(formData.signature, "PNG", 20, 155, 150, 100);
        yOffset += 60; // Adjust space after signature
      }

      // Signature Section (If signature exists)
      if (formData.signatureData) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Signature:", 20, yOffset);
        doc.addImage(formData.signatureData, "PNG", 20, yOffset + 10, 150, 100);
        yOffset += 60;
      }

      // Get current date & time (IST)
      const now = new Date();
      const istNow = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).formatToParts(now);

      const year = istNow.find((part) => part.type === "year").value;
      const month = istNow.find((part) => part.type === "month").value;
      const day = istNow.find((part) => part.type === "day").value;
      let hour = istNow.find((part) => part.type === "hour").value;
      const minute = istNow.find((part) => part.type === "minute").value;
      const ampm = istNow
        .find((part) => part.type === "dayPeriod")
        .value.toUpperCase();

      hour = hour.padStart(2, "0");

      // Format file name as Name_YYYY_MM_DD HH:MMAM/PM.pdf
      const userName = formData.name
        ? formData.name.replace(/\s+/g, "_")
        : "User";
      const fileName = `${userName} ${year}_${month}_${day} ${hour}:${minute}${ampm}.pdf`;

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
      }

      // Save PDF
      doc.save(fileName);
    });
  };

  return (
    <>
      <style>{styl}</style>
      <div className="container-fluid bg-white containerWidth">
        <div className="container">
          <div
            className="row d-flex align-items-center justify-content-center rounded-3"
            style={{ backgroundColor: "#1364AE" }}
          >
            <div className="col-3 col-md-2 col-lg-2 ">
              <img
                src={logo}
                alt="Cryoko logo"
                className="img-fluid ms-lg-3 cryokologo"
              />
            </div>
            <div className="col-9 col-md-10 col-lg-6 justify-content-center mt-3 mt-lg-3 text-white ">
              <p className="addressText">
                Sree Pertharna Enterprises, <br /> 9/4-A, Sriram Layout,
                Coimbatore -641 011 <br />
                cryocbe@gmail.com | www.cryoko.com | <br /> Tel: 0422 490 8701
              </p>
            </div>
          </div>
        </div>
        <div className="container mt-4">
          <div className="row">
            <div className="col-12">
              <p
                className="text-decoration-underline text-center m-0"
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#1364AE",
                }}
              >
                UNDERTAKING AND CONSENT FORM
              </p>
            </div>
            <div className="row">
              <div className="col-12">
                <p style={{ fontSize: "18px" }} className="mt-1">
                  Dear Guest,
                  <br />
                  We request you to kindly read through the below and sign this
                  undertaking and consent form along with your full legal name
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <p
                className="m-0 p-0 "
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#1364AE",
                }}
              >
                CONTRAINDICATIONS FOR WHOLE BODY CRYOKOTHERAPY
              </p>
              <p className="mt-1 m-0" style={{ fontSize: "18px" }}>
                I validate that I do not suffer from any of the following.
              </p>
            </div>
          </div>
        </div>
        {/* Checkboxes Section */}
        <div className="container mt-1 ">
          <div className="row d-flex justify-content-center">
            <div className="col-12 " style={{ fontSize: "18px" }}>
              <label className="checkbox-label ">
                <input
                  type="checkbox"
                  name="diseaseCirculatorySystem"
                  checked={checkboxes.diseaseCirculatorySystem}
                  onChange={handleCheckboxChange}
                />
                Diseases of circulatory system
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="acuteMyocardialInfarction"
                  checked={checkboxes.acuteMyocardialInfarction}
                  onChange={handleCheckboxChange}
                />
                State of acute myocardial infarction or other serious heart
                diseases
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="circulatoryInsufficiency"
                  checked={checkboxes.circulatoryInsufficiency}
                  onChange={handleCheckboxChange}
                />
                Circulatory insufficiency or untreated disturbances of heart
                rhythm
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="pastEmbolisms"
                  checked={checkboxes.pastEmbolisms}
                  onChange={handleCheckboxChange}
                />
                Past embolisms
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="unstableHypertension"
                  checked={checkboxes.unstableHypertension}
                  onChange={handleCheckboxChange}
                />
                Unstable arterial hypertension
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="openSkinwoundsandinjuries"
                  checked={checkboxes.openSkinwoundsandinjuries}
                  onChange={handleCheckboxChange}
                />
                Open Skin wounds and injuries
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="frostbite"
                  checked={checkboxes.frostbite}
                  onChange={handleCheckboxChange}
                />
                Frostbite
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="feveroractiveacuteinfectiousdiseases"
                  checked={checkboxes.feveroractiveacuteinfectiousdiseases}
                  onChange={handleCheckboxChange}
                />
                Fever or active acute infectious diseases
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="cryoglobulinemia"
                  checked={checkboxes.cryoglobulinemia}
                  onChange={handleCheckboxChange}
                />
                Cryoglobulinemia
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="peripheralvasculardiseases"
                  checked={checkboxes.peripheralvasculardiseases}
                  onChange={handleCheckboxChange}
                />
                Peripheral vascular diseases
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="pregnancy"
                  checked={checkboxes.pregnancy}
                  onChange={handleCheckboxChange}
                />
                Pregnancy
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="undertheinfluenceofalcohol"
                  checked={checkboxes.undertheinfluenceofalcohol}
                  onChange={handleCheckboxChange}
                />
                Under the influence of alcohol
              </label>
            </div>
            <div className="col-12">
              <p className="mt-1" style={{ fontSize: "18px" }}>
                In case of presence of any ailment mentioned above, I confirm I
                have a valid Doctor prescription recommending Whole Body
                Cryotherapy treatment.
              </p>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-12">
              <p
                className="m-0"
                style={{
                  fontSize: "22px",
                  fontWeight: "bolder",
                  color: "#1364AE",
                }}
              >
                BEFORE THE TREATMENT
              </p>
              <p style={{ fontSize: "18px" }}>
                Please be informed that any jewellery and/or any other
                metal-containing items should not be worn during the treatment.
                Any wet or damp clothing cannot be worn at any time during the
                session. Kindly ensure that your skin is dry and without any
                open wounds.
              </p>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-12">
              <p
                className="m-0"
                style={{
                  fontSize: "22px",
                  fontWeight: "bolder",
                  color: "#1364AE",
                }}
              >
                AFTER THE TREATMENT
              </p>
              <p style={{ fontSize: "18px" }}>
                It is advisable to undertake any exercise consisting of cardio
                exercises after the treatment, for about 20 minutes.
              </p>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-12">
              <p
                className="m-0"
                style={{
                  fontSize: "22px",
                  fontWeight: "bolder",
                  color: "#1364AE",
                }}
              >
                STATEMENT OF UNDERTAKING
              </p>
              <p style={{ fontSize: "18px" }}>
                I have carefully read this document and I fully understand its
                content. I have been personally briefed about the treatment and
                its outcomes. Knowing the risks involved and the
                contraindications related - 1evertheless chose voluntarily to
                participate in the cryotherapy treatment. I am in good health
                and have no physical condition expressed in the
                contraindications or otherwise which would preclude me from
                safely participating in such treatment. This statement
                constitutes waiver and release of any and liability on Cryoko
                Wellness and all of its employees, owners legal heirs,
                successors and legal representatives against any harm, personal
                injury or any other unprecedented consequences resulting from
                the use of the whole body cryotherapy equipment and treatment.
              </p>
            </div>
          </div>
        </div>

        <div className="container mt-3 mb-3 pb-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 p-4 p-lg-5 border rounded-5 shadow bg-white">
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* Name & Contact Number - Two Columns */}
                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      label="Name"
                      name="name"
                      rules={[
                        { required: true, message: "Please enter your name" },
                        {
                          pattern: /^[A-Za-z. ]+$/,
                          message: "Only letters, spaces, and '.' are allowed",
                        },
                      ]}
                    >
                      <Input placeholder="Enter your name" />
                    </Form.Item>
                  </div>

                  <div className="col-md-6">
                    <Form.Item
                      label="Contact Number"
                      name="contact"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your contact number",
                        },
                        {
                          pattern: /^[0-9+-]+$/,
                          message: "Only numbers, +, and - are allowed",
                        },
                      ]}
                    >
                      <Input
                        maxLength={15}
                        placeholder="Enter contact number"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Address - Full Row */}
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[
                    { required: true, message: "Please enter your address" },
                  ]}
                >
                  {/* <Input.TextArea rows={2} placeholder="Enter your address" /> */}
                  <TextArea
                          placeholder="Enter address"
                          value={address}
                          rows={2}
                          onChange={handleAddressChange}
                          autoSize={{ minRows: 3, maxRows: 3 }}
                          maxLength={100}
                          showCount
                        />
                </Form.Item>

                {/* Emergency Contact Name & Number - Two Columns */}
                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      label="Emergency Contact Name"
                      name="emergencyName"
                      rules={[
                        {
                          required: true,
                          message: "Please enter emergency contact name",
                        },
                        {
                          pattern: /^[A-Za-z. ]+$/,
                          message: "Only letters, spaces, and '.' are allowed",
                        },
                      ]}
                    >
                      <Input placeholder="Enter emergency contact name" />
                    </Form.Item>
                  </div>

                  <div className="col-md-6">
                    <Form.Item
                      label="Emergency Contact Number"
                      name="emergencyNumber"
                      rules={[
                        {
                          required: true,
                          message: "Please enter emergency contact number",
                        },
                        {
                          pattern: /^[0-9+-]+$/,
                          message: "Only numbers, +, and - are allowed",
                        },
                      ]}
                    >
                      <Input
                        maxLength={15}
                        placeholder="Enter emergency contact number"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Date - Full Row */}
                <Form.Item
                  label="Date"
                  name="date"
                  rules={[{ required: true, message: "Please select a date" }]}
                >
                  <DatePicker className="w-100" />
                </Form.Item>

                {/* Signature Box - Full Row */}
                <Form.Item label="Signature" required >
    <SignatureCanvas
      ref={sigCanvas}
      penColor="black"
      canvasProps={{
        width: canvasSize.width,  // Dynamically set width
        height: 500, // Dynamically set height
        className: "border rounded border-3",
      }}
    />
                    <div className="d-flex justify-content-start gap-2 mt-1">
                    <Button onClick={saveSignature} className="savesignbutton">
                      Save Signature
                    </Button>
                    <Button
                      onClick={() => {
                        sigCanvas.current.clear();
                        setSignatureData(""); 
                      }}
                      className="clearsignbutton"
                    >
                      Clear
                    </Button>
                  </div>
                </Form.Item>

                {/* Submit Button - Centered */}
                <div className="text-center mt-4 ">
                  <Button
                    htmlType="submit"
                    className="submitbutton p-3"
                    style={{ fontSize: "1.2rem" }}
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormComponent;
