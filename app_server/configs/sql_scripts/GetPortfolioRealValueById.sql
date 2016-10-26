-- FUNCTION: public.GetPortfolioRealValueById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioRealValueById(integer);

CREATE OR REPLACE FUNCTION public.GetPortfolioRealValueById
(
    s_portfolioid INTEGER
)
RETURNS TABLE (
    ticker VARCHAR(8),
    value NUMERIC
)
AS
$$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.GetPortfolioRealValueForDateById(s_portfolioid, CURRENT_DATE);
END;
$$

LANGUAGE 'plpgsql'