# Smart Home Dashboard

The Smart Home Dashboard is a web-based application that allows you to control and monitor various smart home devices through a user-friendly interface. It integrates with the Hubitat hub to provide seamless control over lights, switches, dimmers, locks, and thermostats.

## Features

- Control lights, switches, and dimmers with a simple click
- Adjust brightness levels of dimmers using sliders
- Lock and unlock smart locks
- Monitor and adjust thermostat settings
- View real-time power consumption of devices
- Organize devices into categories (lights, switches, dimmers, locks, thermostats)
- Responsive design for optimal viewing on different devices

## Prerequisites

Before running the Smart Home Dashboard, ensure that you have the following:

- Hubitat hub set up and configured with smart home devices
- Web server to host the dashboard files
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

1. Clone the repository or download the source code files.
2. Place the files on your web server.
3. Configure the `settings.json` file with your Hubitat hub details:
   - `access_token`: Your Hubitat hub's access token
   - `ip`: The IP address of your Hubitat hub
   - `appNumber`: The app number associated with the dashboard
4. Save the `settings.json` file.

## Usage

1. Open a web browser and navigate to the URL where you hosted the dashboard files.
2. The dashboard will load and display the available smart home devices.
3. Use the navigation buttons at the top to switch between different device categories (lights, switches, dimmers, locks, thermostats).
4. Click on a device tile to toggle its state (on/off) or adjust its settings.
5. For dimmers, use the sliders to adjust the brightness level.
6. Monitor the real-time power consumption of devices, if available.
7. Refresh the page to get the latest device states and updates.

## File Structure

The project consists of the following files:

- `elfegeTiles.html`: The main HTML file that structures the dashboard layout.
- `main.js`: The entry point of the application, handling initialization and UI interactions.
- `initialize.js`: Contains functions for initializing the dashboard and fetching device data from the Hubitat hub.
- `utils.js`: Provides utility functions for sending commands, updating device states, and handling WebSocket connections.
- `globalData.js`: Defines the global data object used throughout the application.
- `requestQueue.js`: Implements a request queue to manage concurrent requests to the Hubitat hub.
- `settings.json`: Configuration file for storing Hubitat hub details.
- `styles.css`: CSS file for styling the dashboard components.

## Contributing

Contributions to the Smart Home Dashboard are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

The Smart Home Dashboard was developed using the following libraries and resources:

- [jQuery](https://jquery.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Axios](https://github.com/axios/axios)
- [Round Slider](https://roundsliderui.com/)

## Contact

For any inquiries or questions, please contact [your-email@example.com](mailto:your-email@example.com).

---

Feel free to customize the README file based on your specific project details, add more sections if needed, and provide clear instructions for installation, usage, and contribution.