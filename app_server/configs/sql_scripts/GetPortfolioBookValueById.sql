-- FUNCTION: public.GetPortfolioBookValueById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioBookValueById(integer);

CREATE OR REPLACE FUNCTION public.GetPortfolioBookValueById
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
	DROP TABLE IF EXISTS OutputTable;
	CREATE TEMP TABLE OutputTable (
        ticker VARCHAR(8),
        value NUMERIC
    );
    
    INSERT INTO OutputTable(ticker, value)
    SELECT
        T.ticker,
        SUM(T.quantity * T.price)
     FROM transactions as T
    WHERE T.portfolioid = s_portfolioid
      AND T.status = 1
      AND T.ticker <> 'RESERVE'
    GROUP BY T.ticker;
    
    INSERT INTO OutputTable(ticker, value)
    SELECT 
    	'RESERVE',
        P.balance
    FROM portfolios AS P
    WHERE P.portfolioid = s_portfolioid;
    
    RETURN QUERY
    SELECT *
    FROM OutputTable;
END;
$$

LANGUAGE 'plpgsql'