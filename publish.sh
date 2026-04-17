#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "${ROOT_DIR}/env.sh" ]; then
    echo "env.sh 不存在"
    exit 1
fi

source "${ROOT_DIR}/env.sh"

LOCAL_FILE="${LOCAL_FILE:-build.tar.gz}"
REMOTE_DIR="${REMOTE_DIR:-~}"
DIST_DIR="${DIST_DIR:-dist/public}"
BUILD_COMMAND="${BUILD_COMMAND:-npx nuxt build --dotenv .env.test}"
REMOTE_SCRIPT="${REMOTE_SCRIPT:-edu-web-pre.sh}"

if [ -z "${REMOTE_HOST}" ] || [ -z "${REMOTE_USER}" ] || [ -z "${REMOTE_SCRIPT}" ]; then
    echo "远程发布配置不完整"
    exit 1
fi

if [ ! -f "${ROOT_DIR}/${REMOTE_SCRIPT}" ]; then
    echo "远程脚本不存在: ${ROOT_DIR}/${REMOTE_SCRIPT}"
    exit 1
fi

echo "Deploying to test environment: ${REMOTE_USER}@${REMOTE_HOST}"

cd "${ROOT_DIR}"
sh -c "${BUILD_COMMAND}"

if command -v gtar >/dev/null 2>&1; then
    TAR_CMD="gtar"
else
    TAR_CMD="tar"
fi

rm -f "${LOCAL_FILE}"
"${TAR_CMD}" -czf "${LOCAL_FILE}" -C "${DIST_DIR}" .

REMOTE_TARGET="${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
REMOTE_COMMAND="cd ${REMOTE_DIR} && chmod +x ${REMOTE_SCRIPT} && ./${REMOTE_SCRIPT}"

if [ -n "${PASSWORD}" ]; then
    sshpass -p "${PASSWORD}" scp "${LOCAL_FILE}" "${REMOTE_SCRIPT}" "${REMOTE_TARGET}"
    sshpass -p "${PASSWORD}" ssh "${REMOTE_USER}@${REMOTE_HOST}" "${REMOTE_COMMAND}"
else
    scp "${LOCAL_FILE}" "${REMOTE_SCRIPT}" "${REMOTE_TARGET}"
    ssh "${REMOTE_USER}@${REMOTE_HOST}" "${REMOTE_COMMAND}"
fi

rm -f "${LOCAL_FILE}"
