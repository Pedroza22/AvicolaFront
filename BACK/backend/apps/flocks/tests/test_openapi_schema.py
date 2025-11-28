import yaml
import os


def test_mortality_stats_present():
    # The test file lives in BACK/backend/apps/flocks/tests
    # We need to climb three levels to reach BACK/backend/docs/openapi_schema.yml
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    candidates = [
        os.path.join(base, 'docs', 'openapi_schema.yml'),
        # historical/alternate location
        os.path.join(base, 'apps', 'docs', 'openapi_schema.yml'),
    ]

    schema_path = None
    for c in candidates:
        if os.path.exists(c):
            schema_path = c
            break

    assert schema_path is not None, f"OpenAPI schema not found in any of {candidates}"

    with open(schema_path, 'r', encoding='utf-8') as fh:
        data = yaml.safe_load(fh)

    paths = data.get('paths', {})
    # We expect the mortality-stats route for flocks (allow id or pk placeholder)
    assert any(p for p in paths.keys() if 'mortality-stats' in p and '/flocks/' in p), \
        f"mortality-stats path not found in schema paths: {list(paths.keys())[:10]}..."
