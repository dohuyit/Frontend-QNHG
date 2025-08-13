const getChartColorsArray = (colors) => {
    // Nếu colors là string thì parse JSON, còn nếu là mảng thì dùng luôn
    if (typeof colors === "string") {
        try {
            colors = JSON.parse(colors);
        } catch (error) {
            console.error("Error parsing colors JSON:", error);
            return [];
        }
    }

    if (!Array.isArray(colors)) {
        console.warn("colors is not an array after parsing:", colors);
        return [];
    }

    return colors.map(function (value) {
        var newValue = value.replace(" ", "");
        if (newValue.indexOf(",") === -1) {
            var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);

            if (color.indexOf("#") !== -1)
                color = color.replace(" ", "");
            if (color) return color;
            else return newValue;
        } else {
            var val = value.split(",");
            if (val.length === 2) {
                var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
                rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
                return rgbaColor;
            } else {
                return newValue;
            }
        }
    });
};

export default getChartColorsArray;
