import json
import os
import unittest
from unittest.mock import MagicMock, patch

os.environ.setdefault('table_name', 'TestTable')
os.environ.setdefault('ip_hash_secret', 'test-secret')

import counter


def make_event(source_ip="203.0.113.7"):
    """Lambda Function URL (payload v2) shaped event."""
    return {
        "version": "2.0",
        "requestContext": {
            "http": {
                "method": "POST",
                "sourceIp": source_ip,
            }
        },
    }


class TestPseudonymizeIp(unittest.TestCase):

    def test_deterministic(self):
        a = counter.pseudonymize_ip("1.2.3.4", "secret")
        b = counter.pseudonymize_ip("1.2.3.4", "secret")
        self.assertEqual(a, b)

    def test_prefix_and_no_raw_ip(self):
        result = counter.pseudonymize_ip("1.2.3.4", "secret")
        self.assertTrue(result.startswith("IP#"))
        self.assertNotIn("1.2.3.4", result)

    def test_different_secret_different_hash(self):
        self.assertNotEqual(
            counter.pseudonymize_ip("1.2.3.4", "secret-a"),
            counter.pseudonymize_ip("1.2.3.4", "secret-b"),
        )


class TestLambdaHandler(unittest.TestCase):

    def _invoke(self, table):
        with patch.object(counter.boto3, 'resource') as mock_resource:
            mock_resource.return_value.Table.return_value = table
            return counter.lambda_handler(make_event(), None)

    def test_new_visitor_increments_count(self):
        table = MagicMock()
        # First get_item: visitor unknown; second: counter row
        table.get_item.side_effect = [
            {},
            {"Item": {"ID": "portfolio_counter", "visitor_count": 5}},
        ]
        response = self._invoke(table)

        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(json.loads(response['body'])['count'], 5)
        table.update_item.assert_called_once()

    def test_repeat_visitor_does_not_increment(self):
        table = MagicMock()
        table.get_item.side_effect = [
            {"Item": {"ID": "IP#known"}},
            {"Item": {"ID": "portfolio_counter", "visitor_count": 5}},
        ]
        response = self._invoke(table)

        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(json.loads(response['body'])['count'], 5)
        table.update_item.assert_not_called()

    def test_missing_source_ip_returns_500(self):
        with patch.object(counter.boto3, 'resource'):
            response = counter.lambda_handler({"requestContext": {}}, None)
        self.assertEqual(response['statusCode'], 500)


if __name__ == '__main__':
    unittest.main()
