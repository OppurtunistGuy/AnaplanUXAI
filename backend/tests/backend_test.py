"""KnowEm Phase 1 - Backend API tests"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://doc-ui-craft-1.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Health & root
class TestRoot:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        assert "KnowEm" in data["message"]

    def test_health(self, api):
        r = api.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"


# Sessions
class TestSessions:
    def test_stats_initial(self, api):
        r = api.get(f"{BASE_URL}/api/stats")
        assert r.status_code == 200
        assert "total_sessions" in r.json()
        assert isinstance(r.json()["total_sessions"], int)

    def test_create_session_and_persist(self, api):
        before = api.get(f"{BASE_URL}/api/stats").json()["total_sessions"]
        payload = {
            "player_a_name": "TEST_Alice",
            "player_b_name": "TEST_Bob",
            "level1_answers": [{"q": 1, "a": "option_a"}],
            "level2_answers": [{"category": "values", "answer": "love"}],
            "status": "completed",
        }
        r = api.post(f"{BASE_URL}/api/sessions", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["player_a_name"] == "TEST_Alice"
        assert data["player_b_name"] == "TEST_Bob"
        assert data["status"] == "completed"
        assert "id" in data and len(data["id"]) > 0
        sid = data["id"]

        # GET by id
        rg = api.get(f"{BASE_URL}/api/sessions/{sid}")
        assert rg.status_code == 200
        got = rg.json()
        assert got["id"] == sid
        assert got["player_a_name"] == "TEST_Alice"
        assert len(got["level1_answers"]) == 1

        # stats incremented
        after = api.get(f"{BASE_URL}/api/stats").json()["total_sessions"]
        assert after == before + 1

    def test_create_session_validation(self, api):
        r = api.post(f"{BASE_URL}/api/sessions", json={"player_a_name": "Only"})
        assert r.status_code == 422
