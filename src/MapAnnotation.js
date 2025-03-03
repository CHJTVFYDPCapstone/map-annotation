import React, { useRef, useState, useEffect } from "react";

const MapAnnotation = () => {
  const [image, setImage] = useState(null);
  const [labels, setLabels] = useState([]);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          setImgSize({ width: img.width, height: img.height });
          setImage(e.target.result);
          setLabels([]);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = image;
      img.onload = () => {
        canvas.width = imgSize.width;
        canvas.height = imgSize.height;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [image, imgSize]);

  const handleImageClick = (event) => {
    if (!image) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);
    
    const labelName = prompt("Enter label name:");
    if (!labelName) return;

    setLabels([...labels, { name: labelName, x, y }]);
  };

  const handleLabelClick = (index) => {
    if (window.confirm("Delete this label?")) {
      setLabels(labels.filter((_, i) => i !== index));
    }
  };

  const downloadLabeledImage = () => {
    if (!image) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = image;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, imgSize.width, imgSize.height);
      ctx.fillStyle = "red";
      ctx.font = "16px Arial";
      labels.forEach((label) => {
        ctx.beginPath();
        ctx.arc(label.x, label.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(label.name, label.x + 8, label.y - 8);
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "labeled_image.png";
      link.click();
    };
  };

  const downloadJSON = () => {
    const json = JSON.stringify({
      imageDimensions: imgSize,
      labels: labels,
    }, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const jsonLink = document.createElement("a");
    jsonLink.href = URL.createObjectURL(blob);
    jsonLink.download = "labels.json";
    jsonLink.click();
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <img src="/logo.png" alt="Logo" style={{ width: "150px", marginBottom: "10px" }} />
      <h1>Map Annotation Software</h1>
      <p>Upload an image, click on it to add labels, and download the image with labels or the label to position mapping.</p>
      <div style={{ margin: "20px 0" }}>
        <input type="file" accept="image/png, image/jpeg" onChange={handleUpload} ref={fileInputRef} 
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button 
          onClick={downloadLabeledImage} 
          disabled={!image}
          style={{ 
            marginLeft: "10px", 
            padding: "10px 15px", 
            borderRadius: "5px", 
            border: "none", 
            backgroundColor: "#007BFF", 
            color: "white", 
            cursor: image ? "pointer" : "not-allowed" 
          }}
        >
          Download image with labels
        </button>
        <button 
          onClick={downloadJSON} 
          disabled={!labels.length}
          style={{ 
            marginLeft: "10px", 
            padding: "10px 15px", 
            borderRadius: "5px", 
            border: "none", 
            backgroundColor: "#28a745", 
            color: "white", 
            cursor: labels.length ? "pointer" : "not-allowed" 
          }}
        >
          Download label to position mapping
        </button>
      </div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 20, border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
        {!image && <p style={{ padding: "20px", color: "gray" }}>No image uploaded</p>}
        <canvas
          ref={canvasRef}
          onClick={handleImageClick}
          style={{ cursor: "crosshair", display: image ? "block" : "none" }}
        />
        {labels.map((label, index) => (
          <div
            key={index}
            onClick={() => handleLabelClick(index)}
            style={{
              position: "absolute",
              left: label.x,
              top: label.y,
              backgroundColor: "rgba(255, 0, 0, 0.75)",
              color: "white",
              padding: "4px 8px",
              fontSize: "12px",
              cursor: "pointer",
              borderRadius: "3px",
              transform: "translate(-50%, -50%)",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            {label.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapAnnotation;
