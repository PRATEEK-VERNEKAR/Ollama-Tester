import streamlit as st
import requests

st.title("Ollama Tester")

request_id = st.text_input("Enter Redis Request ID")

if st.button("Analyze"):
    if request_id:
        response = requests.get(f"http://localhost:5000/analyze/{request_id}/10/20/30/40")

        if response.status_code==200:
            st.success("Analysed Results")
            st.write(response.json())
        else:
            st.error("Error analyzing the request flow")
    else:
        st.warnign("Please enter a valid redis ID")