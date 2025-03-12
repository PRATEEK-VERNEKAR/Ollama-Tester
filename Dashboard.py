import streamlit as st
import requests

def main():
    st.title("Ollama Tester - Integration Verification")

    request_id = st.text_input("Enter Request ID:")
    
    granite_code = st.selectbox(
        "Select Granite Code:",
        ["granite-code:8b", "granite-code:20b", "granite-code:34b","granite-code:8b-instruct","granite-code:20b-instruct","granite-code:34b-instruct"]
    )

    # server1_expected_value = st.number_input("Enter Module 1 Expected Value:", value=0)
    # server2_expected_value = st.number_input("Enter Module 2 Expected Value:", value=0)
    # server3_expected_value = st.number_input("Enter Module 3 Expected Value:", value=0)
    # server4_expected_value = st.number_input("Enter Module 4 Expected Value:", value=0)

    server1_expected_value = 20
    server2_expected_value = 25 
    server3_expected_value = 75
    server4_expected_value = 150

    if st.button("Submit Request"):
        if request_id:
            api_url = "http://localhost:5000/analyze"
            
            payload = {
                "requestId": request_id,
                "modelType": granite_code,
                "s1exp": server1_expected_value,
                "s2exp": server2_expected_value,
                "s3exp": server3_expected_value,
                "s4exp": server4_expected_value
            }
            
            try:
                response = requests.post(api_url, json=payload)
                print(response)
                
                if response.status_code == 200:
                    result_data = response.json()  
                    st.write("API Response:", result_data["msg"])
                    if "code" in result_data:
                        st.text_area("API Response Code:", result_data["code"], height=600)

                else:
                    st.error(f"Error: {response.status_code}. Could not retrieve data from the API.")
            except Exception as e:
                st.error(f"An error occurred: {e}")
        else:
            st.error("Please enter a valid Request ID.")

if __name__ == "__main__":
    main()
