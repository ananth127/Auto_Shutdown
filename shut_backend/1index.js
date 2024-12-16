import os
import platform
import requests
import time

# Node.js API URL to check the shutdown state (with user ID passed in URL)
NODE_API_URL = 'http://192.168.64.76:5000/get-shutdown?uniqueId={}'

# A function to validate if the user ID is correct (this can be expanded to use a database)
def validate_user_id(user_id):
    # You can replace this logic with a database check or any other mechanism
    valid_user_ids = ["valid_id_1", "valid_id_2", "valid_id_3"]  # Example of valid user IDs
    return user_id in valid_user_ids

def check_shutdown(user_id):
    print("Started listening for shutdown state...")  # Indication that the script is listening
    
    # Validate the unique user ID before continuing
    if not validate_user_id(user_id):
        print("Invalid User ID!")
        return  # Exit if the user ID is invalid
    
    while True:
        try:
            print("Fetching shutdown state...")  # Indication that a fetch is occurring
            
            # Make the request to the Node.js API, passing the user ID in the URL
            response = requests.get(NODE_API_URL.format(user_id))
            if response.status_code != 200:
                print("Failed to fetch shutdown state. Exiting...")
                return  # Exit if the request fails
            
            data = response.json()
            shutdown_value = data.get('shutdown', False)

            if shutdown_value:
                system_platform = platform.system().lower()

                if system_platform == 'windows':
                    print("Shutdown state is ON. Shutting down Windows...")
                    os.system("shutdown /s /f /t 0")  # For Windows
                elif system_platform == 'linux' or system_platform == 'darwin':
                    print("Shutdown state is ON. Shutting down Linux/macOS...")
                    os.system("shutdown now")  # For Linux and macOS
                else:
                    print("Unsupported Operating System")
            else:
                print("Shutdown state is OFF. No action taken.")

            time.sleep(10)  # Check every 10 seconds

        except Exception as e:
            print(f"Error: {str(e)}")
            time.sleep(10)  # Retry after a brief pause

if __name__ == '__main__':
    # Here, replace 'valid_user_id' with the actual user ID you want to pass
    user_id = 'valid_id_1'  # Example: valid user ID (this should be passed dynamically)
    check_shutdown(user_id)
